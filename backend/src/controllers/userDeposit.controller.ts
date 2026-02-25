import { Request, Response } from "express";
import { PrismaClient, CoinType, NetworkType } from "@prisma/client";
import { AuthRequest } from "../middlewares/authMiddleware";

const prisma = new PrismaClient();

interface MulterRequest extends AuthRequest {
  file?: Express.Multer.File;
}

/**
 * Helper: Build full URL for uploaded file
 */
const getFullUrl = (req: Request, filePath: string | null): string => {
  if (!filePath) return "";
  const protocol = req.protocol || "http";
  const host = req.get("host") || "localhost:5000";
  return `${protocol}://${host}/${filePath.replace(/\\/g, "/")}`;
};

/**
 * Helper: Validate Prisma Enum
 */
const isValidEnumValue = <T extends Record<string, string>>(
  enumObj: T,
  value: string
): value is T[keyof T] => Object.values(enumObj).includes(value as T[keyof T]);

/**
 * ======================================================
 * USER: Get Deposit Wallet Info
 * GET /api/user/deposit/wallet/:coin/:network
 * ======================================================
 */
export const getDepositWallet = async (req: Request, res: Response) => {
  try {
    const { coin: coinParam, network: networkParam } = req.params;

    if (!coinParam || !networkParam) {
      return res.status(400).json({
        success: false,
        message: "Coin and network are required",
      });
    }

    if (!isValidEnumValue(CoinType, coinParam)) {
      return res.status(400).json({ success: false, message: "Invalid coin" });
    }

    if (!isValidEnumValue(NetworkType, networkParam)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid network" });
    }

    const coin: CoinType = coinParam;
    const network: NetworkType = networkParam;

    const wallet = await prisma.depositWallet.findUnique({
      where: { coin_network: { coin, network } },
    });

    if (!wallet || !wallet.isActive) {
      return res.status(404).json({
        success: false,
        message: `${coin} (${network}) deposit wallet not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        coin: wallet.coin,
        network: wallet.network,
        address: wallet.address,
        qrImage: getFullUrl(req, wallet.qrImage),
      },
    });
  } catch (error) {
    console.error("Get Deposit Wallet Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * ======================================================
 * USER: Create Deposit Request
 * POST /api/user/deposit/create
 * ======================================================
 */
export const createDepositRequest = async (
  req: MulterRequest,
  res: Response
) => {
  try {
    const { coin: coinParam, network: networkParam, amount, transactionHash } =
      req.body;

    if (!coinParam || !networkParam) {
      return res.status(400).json({
        success: false,
        message: "Coin and network are required",
      });
    }

    if (!isValidEnumValue(CoinType, coinParam)) {
      return res.status(400).json({ success: false, message: "Invalid coin" });
    }

    if (!isValidEnumValue(NetworkType, networkParam)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid network" });
    }

    if (!amount || Number(amount) <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Amount must be greater than 0" });
    }

    if (!transactionHash) {
      return res
        .status(400)
        .json({ success: false, message: "Transaction hash is required" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Proof image is required" });
    }

    const coin: CoinType = coinParam;
    const network: NetworkType = networkParam;

    // Prevent duplicate transaction
    const existing = await prisma.depositRequest.findFirst({
      where: { transactionHash },
    });

    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Transaction already submitted" });
    }

    // Verify wallet exists and is active
    const wallet = await prisma.depositWallet.findUnique({
      where: { coin_network: { coin, network } },
    });

    if (!wallet || !wallet.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Deposit wallet not available" });
    }

    // Create deposit request
    const deposit = await prisma.depositRequest.create({
      data: {
        userId: req.user!.id,
        walletId: wallet.id,
        coin,
        network,
        amount: Number(amount),
        transactionHash,
        proofImage: `uploads/proofs/${req.file.filename}`,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Deposit request submitted successfully",
      data: {
        ...deposit,
        proofImage: getFullUrl(req, deposit.proofImage),
      },
    });
  } catch (error) {
    console.error("Create Deposit Request Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};