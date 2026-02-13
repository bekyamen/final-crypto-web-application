import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middlewares/authMiddleware";

const prisma = new PrismaClient();

const allowedCoins = ["BTC", "ETH", "USDT", "XRP", "BNB"];

/**
 * USER: Create Withdraw Request
 */
export const createWithdrawRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { coin, network, address, amount } = req.body;

    if (!coin || !allowedCoins.includes(coin)) {
      return res.status(400).json({ success: false, message: "Invalid coin" });
    }
    if (!network) {
      return res.status(400).json({ success: false, message: "Network is required" });
    }
    if (!address) {
      return res.status(400).json({ success: false, message: "Withdrawal address required" });
    }
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Invalid withdrawal amount" });
    }

    // Get user's current balance
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const fee = 0.0005; // Example fixed fee; you can make it dynamic per coin/network
    if (user.balance < Number(amount) + fee) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    // Create withdrawal request
    const withdrawRequest = await prisma.withdrawRequest.create({
      data: {
        userId: req.user!.id,
        coin,
        network,
        address,
        amount: Number(amount),
        fee,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted",
      data: withdrawRequest,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * ADMIN: Get Pending Withdrawals
 */
export const getPendingWithdrawals = async (req: AuthRequest, res: Response) => {
  try {
    const withdrawals = await prisma.withdrawRequest.findMany({
      where: { status: "PENDING" },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ success: true, data: withdrawals });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * ADMIN: Approve Withdrawal
 */
export const approveWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const withdrawal = await prisma.withdrawRequest.findUnique({ where: { id } });
    if (!withdrawal || withdrawal.status !== "PENDING") {
      return res.status(404).json({ success: false, message: "Withdrawal not found or already processed" });
    }

    await prisma.$transaction(async (tx) => {
      // Deduct amount + fee from user balance
      await tx.user.update({
        where: { id: withdrawal.userId },
        data: { balance: { decrement: withdrawal.amount + withdrawal.fee } },
      });

      // Mark withdrawal as approved
      await tx.withdrawRequest.update({
        where: { id },
        data: { status: "APPROVED", reviewedBy: req.user!.id },
      });
    });

    return res.status(200).json({ success: true, message: "Withdrawal approved successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * ADMIN: Reject Withdrawal
 */
export const rejectWithdrawal = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const withdrawal = await prisma.withdrawRequest.findUnique({ where: { id } });
    if (!withdrawal || withdrawal.status !== "PENDING") {
      return res.status(404).json({ success: false, message: "Withdrawal not found or already processed" });
    }

    await prisma.withdrawRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        reviewedBy: req.user!.id,
        reviewNote: reason || "No reason provided",
      },
    });

    return res.status(200).json({ success: true, message: "Withdrawal rejected" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
