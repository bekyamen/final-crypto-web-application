import { Request, Response } from "express";
import { PrismaClient, DepositStatus } from "@prisma/client";
import fs from "fs";
import path from "path";
import { AuthRequest } from "../middlewares/authMiddleware";

const prisma = new PrismaClient();


interface MulterRequest extends AuthRequest {
  file?: Express.Multer.File;
}

const allowedCoins = ["BTC", "ETH", "USDT"];

/**
 * ===============================
 * ADMIN: Create / Update Wallet
 * ===============================
 */
export const setDepositWallet = async (
  req: MulterRequest,
  res: Response
): Promise<void> => {
  try {
    const { coin, address } = req.body;

    if (!coin || !allowedCoins.includes(coin)) {
      res.status(400).json({ success: false, message: "Invalid coin type" });
      return;
    }

    if (!address) {
      res.status(400).json({ success: false, message: "Wallet address required" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: "QR image required" });
      return;
    }

    const existingWallet = await prisma.depositWallet.findUnique({
      where: { coin },
    });

    if (existingWallet?.qrImage) {
      const oldImagePath = path.join(process.cwd(), existingWallet.qrImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const wallet = await prisma.depositWallet.upsert({
      where: { coin },
      update: {
        address,
        qrImage: `uploads/qr/${req.file.filename}`,
      },
      create: {
        coin,
        address,
        qrImage: `uploads/qr/${req.file.filename}`,
      },
    });

    res.status(200).json({
      success: true,
      message: `${coin} wallet saved successfully`,
      data: wallet,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * ===============================
 * ADMIN: Get All Deposit Wallets
 * GET /api/admin/deposit/wallets
 * ===============================
 */
export const getAllDepositWallets = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const wallets = await prisma.depositWallet.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      count: wallets.length,
      data: wallets,
    });
  } catch (error) {
    console.error("Get All Wallets Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




/**
 * ===============================
 * ADMIN: Edit Deposit Wallet
 * PUT /api/admin/deposit-wallet/:coin
 * ===============================
 */
export const editDepositWallet = async (
  req: MulterRequest,
  res: Response
) => {
  try {
    const { coin } = req.params; // BTC / ETH / USDT
    const { address } = req.body;

    // Validate coin
    if (!allowedCoins.includes(coin)) {
      return res.status(400).json({ success: false, message: "Invalid coin type" });
    }

    // Fetch existing wallet
    const wallet = await prisma.depositWallet.findUnique({
      where: { coin },
    });

    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }

    // Update QR image if uploaded
    let qrImagePath = wallet.qrImage;
    if (req.file) {
      // Delete old QR image
      if (wallet.qrImage && fs.existsSync(path.join(process.cwd(), wallet.qrImage))) {
        fs.unlinkSync(path.join(process.cwd(), wallet.qrImage));
      }
      qrImagePath = `uploads/qr/${req.file.filename}`;
    }

    // Update wallet in DB
    const updatedWallet = await prisma.depositWallet.update({
      where: { coin },
      data: {
        address: address || wallet.address, // update if provided
        qrImage: qrImagePath,
      },
    });

    return res.status(200).json({
      success: true,
      message: `${coin} wallet updated successfully`,
      data: updatedWallet,
    });
  } catch (error) {
    console.error("Edit Deposit Wallet Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const getDepositById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const deposit = await prisma.depositRequest.findUnique({
      where: { id },
      include: { user: true, wallet: true }, // include related user and wallet info
    });

    if (!deposit) {
      res.status(404).json({ success: false, message: "Deposit not found" });
      return;
    }

    res.status(200).json({ success: true, data: deposit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * ===============================
 * ADMIN: Get Deposit History
 * ===============================
 */
export const getDepositHistory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId, coin, status } = req.query;

    const where: any = {};

    if (userId) where.userId = String(userId);
    if (coin) where.coin = String(coin);
    if (status && Object.values(DepositStatus).includes(String(status) as DepositStatus)) {
      where.status = String(status);
    }

    const deposits = await prisma.depositRequest.findMany({
      where,
      include: { user: true, wallet: true },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, data: deposits });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};





/**
 * ===============================
 * USER: Get Deposit Wallet
 * ===============================
 */
export const getDepositWallet = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { coin } = req.params;

    if (!coin || !allowedCoins.includes(coin)) {
      res.status(400).json({ success: false, message: "Invalid coin type" });
      return;
    }

    const wallet = await prisma.depositWallet.findUnique({
      where: { coin },
    });

    if (!wallet || !wallet.isActive) {
      res.status(404).json({ success: false, message: "Wallet not available" });
      return;
    }

    const qrImageUrl = `${req.protocol}://${req.get("host")}/${wallet.qrImage}`;

    res.status(200).json({
      success: true,
      data: {
        coin: wallet.coin,
        address: wallet.address,
        qrImage: qrImageUrl,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * ===============================
 * USER: Create Deposit Request
 * ===============================
 */
export const createDepositRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { coin, amount, transactionHash } = req.body;

    if (!coin || !allowedCoins.includes(coin)) {
      res.status(400).json({ success: false, message: "Invalid coin" });
      return;
    }

    if (!amount || Number(amount) <= 0) {
      res.status(400).json({ success: false, message: "Invalid amount" });
      return;
    }

    if (!transactionHash) {
      res.status(400).json({ success: false, message: "Transaction hash required" });
      return;
    }

    const existing = await prisma.depositRequest.findFirst({
      where: { transactionHash },
    });

    if (existing) {
      res.status(400).json({
        success: false,
        message: "Transaction hash already submitted",
      });
      return;
    }

    const wallet = await prisma.depositWallet.findUnique({
      where: { coin },
    });

    if (!wallet || !wallet.isActive) {
      res.status(404).json({
        success: false,
        message: "Deposit wallet not available",
      });
      return;
    }

    const deposit = await prisma.depositRequest.create({
      data: {
        userId: req.user!.id,
        walletId: wallet.id,
        coin,
        amount: Number(amount),
        transactionHash,
      },
    });

    res.status(201).json({
      success: true,
      message: "Deposit request submitted",
      data: deposit,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * ===============================
 * ADMIN: Get Pending Deposits
 * ===============================
 */
export const getPendingDeposits = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const deposits = await prisma.depositRequest.findMany({
      where: { status: DepositStatus.PENDING },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, data: deposits });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * ===============================
 * ADMIN: Approve Deposit
 * ===============================
 */
export const approveDeposit = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const deposit = await prisma.depositRequest.findUnique({ where: { id } });

    if (!deposit || deposit.status !== DepositStatus.PENDING) {
      res.status(404).json({
        success: false,
        message: "Deposit not found or already processed",
      });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.depositRequest.update({
        where: { id },
        data: {
          status: DepositStatus.APPROVED,
          reviewedBy: req.user!.id,
        },
      });

      await tx.user.update({
        where: { id: deposit.userId },
        data: {
          balance: { increment: deposit.amount },
        },
      });
    });

    res.status(200).json({
      success: true,
      message: "Deposit approved successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * ===============================
 * ADMIN: Reject Deposit
 * ===============================
 */
export const rejectDeposit = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    await prisma.depositRequest.update({
      where: { id },
      data: {
        status: DepositStatus.REJECTED,
        reviewedBy: req.user!.id,
        reviewNote: reason || "Rejected by admin",
      },
    });

    res.status(200).json({
      success: true,
      message: "Deposit rejected",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * ===============================
 * ADMIN: Delete Deposit Wallet
 * DELETE /api/admin/deposit-wallet/:coin
 * ===============================
 */
export const deleteDepositWallet = async (req: Request, res: Response) => {
  try {
    const { coin } = req.params;

    // Validate coin
    if (!allowedCoins.includes(coin)) {
      return res.status(400).json({ success: false, message: "Invalid coin type" });
    }

    // Find wallet
    const wallet = await prisma.depositWallet.findUnique({ where: { coin } });

    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }

    // Delete QR image file if exists
    if (wallet.qrImage && fs.existsSync(path.join(process.cwd(), wallet.qrImage))) {
      fs.unlinkSync(path.join(process.cwd(), wallet.qrImage));
    }

    // Delete wallet from DB
    await prisma.depositWallet.delete({ where: { coin } });

    return res.status(200).json({
      success: true,
      message: `${coin} deposit wallet deleted successfully`,
    });
  } catch (error) {
    console.error("Delete Deposit Wallet Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};