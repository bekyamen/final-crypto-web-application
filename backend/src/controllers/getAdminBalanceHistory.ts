import { Response } from "express";
import { PrismaClient, UserRole } from "@prisma/client";
import { AuthRequest } from "../middlewares/authMiddleware";

const prisma = new PrismaClient();

/**
 * ===============================
 * ADMIN: Get Balance Addition History
 * ===============================
 */
export const getAdminBalanceHistory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const adminId = req.user.id;
    const adminRole = req.user.role;

    if (adminRole !== UserRole.ADMIN && adminRole !== UserRole.SUPER_ADMIN) {
      res.status(403).json({ success: false, message: "Unauthorized" });
      return;
    }

    const actions = await prisma.auditLog.findMany({
      where: { adminId, action: "ADMIN_ADD_BALANCE" },
      orderBy: { createdAt: "desc" },
      take: 50, // last 50 actions
    });

    res.status(200).json({ success: true, data: actions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
