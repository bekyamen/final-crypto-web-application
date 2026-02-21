import {  Response } from "express";
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
export const setDepositWallet = async (req: MulterRequest, res: Response) => {
  try {
    const { coin, address } = req.body;

    if (!coin || !allowedCoins.includes(coin)) {
      return res.status(400).json({ success: false, message: "Invalid coin type" });
    }

    if (!address) {
      return res.status(400).json({ success: false, message: "Wallet address required" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "QR image required" });
    }

    const existingWallet = await prisma.depositWallet.findUnique({ where: { coin } });

    if (existingWallet?.qrImage) {
      const oldImagePath = path.join(process.cwd(), existingWallet.qrImage);
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
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

    return res.status(200).json({
      success: true,
      message: `${coin} wallet saved successfully`,
      data: wallet,
    });
  } catch (error) {
    console.error("Set Deposit Wallet Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * ===============================
 * ADMIN: Get All Deposit Wallets
 * ===============================
 */
export const getAllDepositWallets = async (_req: AuthRequest, res: Response) => {
  try {
    const wallets = await prisma.depositWallet.findMany({ orderBy: { createdAt: "desc" } });
    return res.status(200).json({
      success: true,
      count: wallets.length,
      data: wallets,
    });
  } catch (error) {
    console.error("Get All Wallets Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * ===============================
 * ADMIN: Edit Deposit Wallet
 * ===============================
 */
export const editDepositWallet = async (req: MulterRequest, res: Response) => {
  try {
    const { coin } = req.params;
    const { address } = req.body;

    if (!allowedCoins.includes(coin)) {
      return res.status(400).json({ success: false, message: "Invalid coin type" });
    }

    const wallet = await prisma.depositWallet.findUnique({ where: { coin } });
    if (!wallet) return res.status(404).json({ success: false, message: "Wallet not found" });

    let qrImagePath = wallet.qrImage;
    if (req.file) {
      if (wallet.qrImage && fs.existsSync(path.join(process.cwd(), wallet.qrImage))) {
        fs.unlinkSync(path.join(process.cwd(), wallet.qrImage));
      }
      qrImagePath = `uploads/qr/${req.file.filename}`;
    }

    const updatedWallet = await prisma.depositWallet.update({
      where: { coin },
      data: {
        address: address || wallet.address,
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

/**
 * ===============================
 * ADMIN: Get Deposit by ID
 * ===============================
 */
export const getDepositById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deposit = await prisma.depositRequest.findUnique({
      where: { id },
      include: { user: true, wallet: true },
    });

    if (!deposit) return res.status(404).json({ success: false, message: "Deposit not found" });

    return res.status(200).json({ success: true, data: deposit });
  } catch (error) {
    console.error("Get Deposit By ID Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * ===============================
 * ADMIN: Get Deposit History
 * ===============================
 */
export const getDepositHistory = async (req: AuthRequest, res: Response) => {
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

    return res.status(200).json({ success: true, data: deposits });
  } catch (error) {
    console.error("Get Deposit History Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * ===============================
 * ADMIN: Get Pending Deposits
 * ===============================
 */
export const getPendingDeposits = async (_req: AuthRequest, res: Response) => {
  try {
    const deposits = await prisma.depositRequest.findMany({
      where: { status: DepositStatus.PENDING },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, data: deposits });
  } catch (error) {
    console.error("Get Pending Deposits Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * ===============================
 * ADMIN: Approve Deposit
 * ===============================
 */
export const approveDeposit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deposit = await prisma.depositRequest.findUnique({ where: { id } });

    if (!deposit || deposit.status !== DepositStatus.PENDING) {
      return res.status(404).json({ success: false, message: "Deposit not found or already processed" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.depositRequest.update({
        where: { id },
        data: { status: DepositStatus.APPROVED, reviewedBy: req.user!.id },
      });

      await tx.user.update({
        where: { id: deposit.userId },
        data: { balance: { increment: deposit.amount } },
      });
    });

    return res.status(200).json({ success: true, message: "Deposit approved successfully" });
  } catch (error) {
    console.error("Approve Deposit Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * ===============================
 * ADMIN: Reject Deposit
 * ===============================
 */
export const rejectDeposit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    await prisma.depositRequest.update({
      where: { id },
      data: { status: DepositStatus.REJECTED, reviewedBy: req.user!.id, reviewNote: reason || "Rejected by admin" },
    });

    return res.status(200).json({ success: true, message: "Deposit rejected" });
  } catch (error) {
    console.error("Reject Deposit Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * ===============================
 * ADMIN: Delete Deposit Wallet
 * ===============================
 */
export const deleteDepositWallet = async (req: AuthRequest, res: Response) => {
  try {
    const { coin } = req.params;

    if (!allowedCoins.includes(coin)) {
      return res.status(400).json({ success: false, message: "Invalid coin type" });
    }

    const wallet = await prisma.depositWallet.findUnique({ where: { coin } });
    if (!wallet) return res.status(404).json({ success: false, message: "Wallet not found" });

    if (wallet.qrImage && fs.existsSync(path.join(process.cwd(), wallet.qrImage))) {
      fs.unlinkSync(path.join(process.cwd(), wallet.qrImage));
    }

    await prisma.depositWallet.delete({ where: { coin } });

    return res.status(200).json({ success: true, message: `${coin} deposit wallet deleted successfully` });
  } catch (error) {
    console.error("Delete Deposit Wallet Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};