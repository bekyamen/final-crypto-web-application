import { Response } from "express";
import { PrismaClient, UserRole } from "@prisma/client";
import { AuthRequest } from "../middlewares/authMiddleware";

const prisma = new PrismaClient();

/**
 * =====================================
 * ADMIN: Get Demo Balance History
 * =====================================
 */
export const getDemoBalanceHistory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    // 🔒 Only ADMIN or SUPER_ADMIN
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.role !== UserRole.SUPER_ADMIN
    ) {
      res.status(403).json({
        success: false,
        message: "Forbidden",
      });
      return;
    }

    const history = await prisma.auditLog.findMany({
      where: {
        action: {
          in: [
            "ADMIN_ADD_DEMO_BALANCE",
            "ADMIN_SET_DEMO_BALANCE",
          ],
        },
      },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
          },
        },
        targetUser: {
          select: {
            id: true,
            email: true,
            demoBalance: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error("Demo balance history error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};