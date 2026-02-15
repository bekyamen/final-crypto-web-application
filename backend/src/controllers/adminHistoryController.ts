import { Response } from "express";
import { PrismaClient, UserRole } from "@prisma/client";
import { AuthRequest } from "../middlewares/authMiddleware";

const prisma = new PrismaClient();

/**
 * =====================================
 * ADMIN: Get Balance Addition History
 * =====================================
 */
export const getAddBalanceHistory = async (
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

    const adminRole = req.user.role;

    // 🔒 Only ADMIN or SUPER_ADMIN
    if (adminRole !== UserRole.ADMIN && adminRole !== UserRole.SUPER_ADMIN) {
      res.status(403).json({
        success: false,
        message: "Forbidden",
      });
      return;
    }

    const history = await prisma.auditLog.findMany({
      where: {
        action: "ADMIN_ADD_BALANCE",
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
            balance: true,
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
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
