// controllers/identityVerificationController.ts
import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middlewares/authMiddleware";
import fs from "fs";
import path from "path";
import { getFileUrl } from "../helpers/fileUrl";

const prisma = new PrismaClient();

// ---------------------------
// Internal type for Multer files
// ---------------------------
interface MulterRequest extends AuthRequest {
  files?: {
    frontSide?: Express.Multer.File[];
    backSide?: Express.Multer.File[];
  };
}

// ===============================
// USER: Submit Verification
// ===============================
export const submitVerification = async (req: AuthRequest, res: Response) => {
  try {
    const multerReq = req as MulterRequest; // cast to access files
    const userId = req.user?.id;
    const { fullName, documentNumber, documentType } = req.body;

    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const frontFile = multerReq.files?.frontSide?.[0];
    const backFile = multerReq.files?.backSide?.[0];

    if (!fullName || !documentNumber || !documentType || !frontFile || !backFile) {
      return res.status(400).json({ message: "All fields and both images are required" });
    }

    // Prevent duplicate pending request
    const existing = await prisma.identityVerification.findFirst({
      where: { userId, status: "PENDING" },
    });
    if (existing) return res.status(400).json({ message: "You already have a pending verification request" });

    // Ensure uploads folder exists
    const uploadFolder = path.join(__dirname, "../../uploads/identity");
    if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true });

    // Save files to disk
    const frontFilename = `${Date.now()}-${frontFile.originalname}`;
    const backFilename = `${Date.now()}-${backFile.originalname}`;

    fs.writeFileSync(path.join(uploadFolder, frontFilename), frontFile.buffer);
    fs.writeFileSync(path.join(uploadFolder, backFilename), backFile.buffer);

    // Save to database
    const verification = await prisma.identityVerification.create({
      data: {
        userId,
        fullName,
        documentNumber,
        documentType: documentType.toUpperCase(),
        frontSideUrl: `/uploads/identity/${frontFilename}`,
        backSideUrl: `/uploads/identity/${backFilename}`,
        status: "PENDING",
      },
    });

    return res.status(201).json({
      message: "Verification submitted successfully",
      verification: {
        ...verification,
        frontSideUrl: getFileUrl(req, verification.frontSideUrl),
        backSideUrl: getFileUrl(req, verification.backSideUrl),
      },
    });
  } catch (error: any) {
    console.error("Verification submit error:", error);
    return res.status(500).json({ message: "Internal server error", details: error.message });
  }
};


// ===============================
// ADMIN: Get Reviewed Verifications (History)
// ===============================
export const getReviewedVerifications = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as string | undefined; 
    const skip = (page - 1) * limit;

    const whereCondition: any = {
      status: { in: ["APPROVED", "REJECTED"] },
    };

    // Optional filter by status
    if (status && ["APPROVED", "REJECTED"].includes(status)) {
      whereCondition.status = status;
    }

    const [verifications, total] = await Promise.all([
      prisma.identityVerification.findMany({
        where: whereCondition,
        include: {
          user: true,
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.identityVerification.count({ where: whereCondition }),
    ]);

    const formatted = verifications.map(v => ({
      ...v,
      frontSideUrl: getFileUrl(req, v.frontSideUrl),
      backSideUrl: getFileUrl(req, v.backSideUrl),
    }));

    return res.status(200).json({
      data: formatted,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get reviewed verifications error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



// ===============================
// USER: Get My Verification Status
// ===============================
export const getMyVerification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const verification = await prisma.identityVerification.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) return res.status(200).json({ verification: null });

    return res.status(200).json({
      verification: {
        ...verification,
        frontSideUrl: getFileUrl(req, verification.frontSideUrl),
        backSideUrl: getFileUrl(req, verification.backSideUrl),
      },
    });
  } catch (error) {
    console.error("Get my verification error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ===============================
// ADMIN: Get Pending Verifications (Paginated)
// ===============================
export const getPendingVerifications = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "SUPER_ADMIN") return res.status(403).json({ message: "Access denied" });

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [verifications, total] = await Promise.all([
      prisma.identityVerification.findMany({
        where: { status: "PENDING" },
        include: { user: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.identityVerification.count({ where: { status: "PENDING" } }),
    ]);

    const formatted = verifications.map(v => ({
      ...v,
      frontSideUrl: getFileUrl(req, v.frontSideUrl),
      backSideUrl: getFileUrl(req, v.backSideUrl),
    }));

    return res.status(200).json({
      data: formatted,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get pending verifications error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ===============================
// ADMIN: Review Verification
// ===============================
export const reviewVerification = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.id;
    const { id } = req.params;
    const { status, reviewNote } = req.body;

    if (!adminId) return res.status(401).json({ message: "Admin not authenticated" });
    if (!["APPROVED", "REJECTED"].includes(status)) return res.status(400).json({ message: "Invalid status" });

    const verification = await prisma.identityVerification.update({
      where: { id },
      data: { status, reviewNote: reviewNote || null, reviewedBy: adminId },
    });

    return res.status(200).json({ message: "Verification reviewed", verification });
  } catch (error: any) {
    console.error("Review verification error:", error);
    return res.status(500).json({ message: "Internal server error", details: error.message });
  }
};