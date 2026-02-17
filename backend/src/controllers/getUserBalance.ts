import { Response } from "express";
import { PrismaClient, UserRole } from "@prisma/client";
import { AuthRequest } from "../middlewares/authMiddleware";

const prisma = new PrismaClient();

/**
 * ===============================
 * USER: Get Own Demo Balance
 * ===============================
 */
export const getUserDemoBalance = async (
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

    const userId = req.user.id;
    const isAdminRequest = req.user.role === UserRole.ADMIN || req.user.role === UserRole.SUPER_ADMIN;

    // Fetch demo balance (optionally more data for admin)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        demoBalance: true,
        ...(isAdminRequest && { role: true }), // admin can see role
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "User demo balance fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
