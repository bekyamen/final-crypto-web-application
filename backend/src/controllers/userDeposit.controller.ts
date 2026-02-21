// controllers/userDeposit.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middlewares/authMiddleware"; // JWT user info
import path from "path";

const prisma = new PrismaClient();

// Extend AuthRequest to include file (for Multer)
interface MulterRequest extends AuthRequest {
  file?: Express.Multer.File;
}

const allowedCoins = ["BTC", "ETH", "USDT"];

/**
 * ===============================
 * USER: Get Deposit Wallet Info
 * GET /api/user/deposit/wallet/:coin
 * ===============================
 */
export const getDepositWallet = async (
  req: Request,
  res: Response
) => {
  try {
    const { coin } = req.params;

    if (!coin) {
      return res.status(400).json({
        success: false,
        message: "Coin is required"
      });
    }

    const wallet = await prisma.depositWallet.findUnique({
      where: { coin }
    });

    if (!wallet || !wallet.isActive) {
      return res.status(404).json({
        success: false,
        message: `${coin} deposit wallet not found`
      });
    }

    // Build full URL for QR image
    const qrImageUrl = `${req.protocol}://${req.get("host")}/${wallet.qrImage}`;

    return res.status(200).json({
      success: true,
      data: {
        coin: wallet.coin,
        address: wallet.address,
        qrImage: qrImageUrl
      }
    });
  } catch (error) {
    console.error("Get Deposit Wallet Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * ===============================
 * USER: Create Deposit Request with Proof Image
 * POST /api/user/deposit/create
 * ===============================
 */
export const createDepositRequest = async (
  req: MulterRequest,
  res: Response
) => {
  try {
    const { coin, amount, transactionHash } = req.body;

    if (!coin || !allowedCoins.includes(coin)) {
      return res.status(400).json({ success: false, message: "Invalid coin" });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    if (!transactionHash) {
      return res.status(400).json({ success: false, message: "Transaction hash required" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Proof image required" });
    }

    // Check for duplicate transaction
    const existing = await prisma.depositRequest.findFirst({
      where: { transactionHash },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: "Transaction hash already submitted" });
    }

    // Get wallet
    const wallet = await prisma.depositWallet.findUnique({ where: { coin } });
    if (!wallet || !wallet.isActive) {
      return res.status(404).json({ success: false, message: "Deposit wallet not available" });
    }

    // Save deposit request
    const deposit = await prisma.depositRequest.create({
      data: {
        userId: req.user!.id,
        walletId: wallet.id,
        coin,
        amount: Number(amount),
        transactionHash,
        proofImage: `uploads/proofs/${req.file.filename}`, // store uploaded proof image
      },
    });

    return res.status(201).json({
      success: true,
      message: "Deposit request submitted",
      data: deposit,
    });
  } catch (error) {
    console.error("Create Deposit Request Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};