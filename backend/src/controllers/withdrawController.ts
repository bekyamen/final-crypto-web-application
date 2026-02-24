import { Request, Response } from "express";

import {
  PrismaClient,
  CoinType,
  NetworkType,
  WithdrawStatus,
} from "@prisma/client";

import { withdrawFees, MIN_WITHDRAW_USD } from "../utils/withdrawConfig";

const prisma = new PrismaClient();

/**
 * ================================
 * USER - CREATE WITHDRAW REQUEST
 * ================================
 */

interface CreateWithdrawBody {
  coin: CoinType;
  network: NetworkType;
  address: string;
  amount: number;
}

export const createWithdrawRequest = async (req: any, res: any) => {
  try {
    const userId: string = req.user.id;
    const { coin, network, address, amount } =
      req.body as CreateWithdrawBody;

    // Basic validation
    if (!coin || !network || !address || !amount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Invalid withdrawal amount" });
    }

    // Validate network + fee
    const feeCrypto = withdrawFees[coin]?.[network];

    if (feeCrypto === undefined) {
      return res.status(400).json({
        message: "Invalid network selected for this coin",
      });
    }

    // Get crypto price
    const cryptoPrice = await prisma.cryptoPrice.findUnique({
      where: { symbol: coin },
    });

    if (!cryptoPrice) {
      return res.status(400).json({
        message: "Crypto price not available",
      });
    }

    // Convert to USD
    const withdrawalUSD = numericAmount * cryptoPrice.price;
    const feeUSD = feeCrypto * cryptoPrice.price;
    const totalUSD = withdrawalUSD + feeUSD;

    // Minimum withdrawal check
    if (withdrawalUSD < MIN_WITHDRAW_USD) {
      return res.status(400).json({
        message: `Minimum withdrawal is ${MIN_WITHDRAW_USD} USD`,
      });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (Number(user.balance) < totalUSD) {
      return res.status(400).json({
        message: "Insufficient balance",
      });
    }

    // Atomic DB transaction
    await prisma.$transaction([
      // Deduct balance immediately
      prisma.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: totalUSD },
        },
      }),

      // Create withdraw request
      prisma.withdrawRequest.create({
        data: {
          userId,
          coin,
          network,
          address,
          amount: numericAmount,
          fee: feeCrypto,
          usdValue: totalUSD,
          status: WithdrawStatus.PENDING,
        },
      }),

      // Log transaction
      prisma.transaction.create({
        data: {
          userId,
          coinId: coin,
          coinName: coin,
          coinSymbol: coin,
          type: "WITHDRAWAL",
          quantity: numericAmount,
          price: cryptoPrice.price,
          total: totalUSD,
          fee: feeUSD,
          notes: "Withdrawal request submitted",
        },
      }),
    ]);

    return res.json({
      message: "Withdrawal request submitted successfully",
    });
  } catch (error) {
    console.error("Create Withdraw Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserWithdraws = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const withdraws = await prisma.withdrawRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.withdrawRequest.count({
      where: { userId },
    });

    return res.json({
      data: withdraws,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get User Withdraw Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const getUserWithdrawById = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const withdraw = await prisma.withdrawRequest.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!withdraw) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    return res.json(withdraw);
  } catch (error) {
    console.error("Get Withdraw By Id Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAllWithdraws = async (req: any, res: any) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const withdraws = await prisma.withdrawRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.withdrawRequest.count();

    return res.json({
      data: withdraws,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get All Withdraw Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const getPendingWithdraws = async (req: any, res: any) => {
  try {
    const withdraws = await prisma.withdrawRequest.findMany({
      where: {
        status: WithdrawStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      data: withdraws,
    });
  } catch (error) {
    console.error("Get Pending Withdraw Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      errorCode: "INTERNAL_ERROR",
    });
  }
};




/**
 * ================================
 * ADMIN - APPROVE WITHDRAW
 * ================================
 */

export const approveWithdraw = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const adminId: string = req.user.id;

    const withdrawal = await prisma.withdrawRequest.findUnique({
      where: { id },
    });

    if (!withdrawal || withdrawal.status !== WithdrawStatus.PENDING) {
      return res.status(400).json({ message: "Invalid request" });
    }

    await prisma.withdrawRequest.update({
      where: { id },
      data: {
        status: WithdrawStatus.APPROVED,
        reviewedBy: adminId,
      },
    });

    return res.json({
      message: "Withdrawal approved successfully",
    });
  } catch (error) {
    console.error("Approve Withdraw Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ================================
 * ADMIN - REJECT WITHDRAW
 * ================================
 */

export const rejectWithdraw = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId: string = req.user.id;

    const withdrawal = await prisma.withdrawRequest.findUnique({
      where: { id },
    });

    if (!withdrawal || withdrawal.status !== WithdrawStatus.PENDING) {
      return res.status(400).json({ message: "Invalid request" });
    }

    await prisma.$transaction([
      // Refund user
      prisma.user.update({
        where: { id: withdrawal.userId },
        data: {
          balance: { increment: withdrawal.usdValue },
        },
      }),

      // Update status
      prisma.withdrawRequest.update({
        where: { id },
        data: {
          status: WithdrawStatus.REJECTED,
          reviewedBy: adminId,
          reviewNote: reason || "Rejected by admin",
        },
      }),
    ]);

    return res.json({
      message: "Withdrawal rejected & refunded successfully",
    });
  } catch (error) {
    console.error("Reject Withdraw Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getWithdrawalHistory = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    let whereCondition: any = {};

    if (status && Object.values(WithdrawStatus).includes(status as WithdrawStatus)) {
      whereCondition.status = status as WithdrawStatus;
    } else {
      // default: only APPROVED and REJECTED
      whereCondition.status = {
        in: [WithdrawStatus.APPROVED, WithdrawStatus.REJECTED],
      };
    }

    const withdrawals = await prisma.withdrawRequest.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: withdrawals.length,
      data: withdrawals,
    });
  } catch (error) {
    console.error("Get withdrawal history error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      errorCode: "INTERNAL_ERROR",
    });
  }
};