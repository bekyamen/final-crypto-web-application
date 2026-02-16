import { Response } from "express";
import { PrismaClient } from "@prisma/client";
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

    // Fetch only the user's demo balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        demoBalance: true, // ✅ return demo balance instead of real balance
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
