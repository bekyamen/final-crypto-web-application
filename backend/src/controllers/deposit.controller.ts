import { Response } from "express";
import {
  PrismaClient,
  DepositStatus,
  NetworkType,
  CoinType,
} from "@prisma/client";



import { AuthRequest } from "../middlewares/authMiddleware";


const prisma = new PrismaClient();
import { getQrUrl } from "../helpers/qrUrl";
import { getFileUrl } from "../helpers/fileUrl";





interface MulterRequest extends AuthRequest {

  file?: Express.Multer.File;
}


const isValidCoin = (value: any): value is CoinType => {
  return Object.values(CoinType).includes(value);
};

const isValidNetwork = (value: any): value is NetworkType => {
  return Object.values(NetworkType).includes(value);
};


/**
 * ===============================
 * ADMIN: Create / Update Wallet
 * ===============================
 */

/**
 * Helper: Format deposit to include full URLs for wallet QR and proof image
 */



const formatDeposit = (req: AuthRequest, deposit: any) => ({
  ...deposit,
  proofImage: deposit.proofImage ? getFileUrl(req, deposit.proofImage) : null,
  wallet: deposit.wallet
    ? {
        ...deposit.wallet,
        qrImage: deposit.wallet.qrImage ? getQrUrl(req, deposit.wallet.qrImage) : null,
      }
    : null,
});



export const setDepositWallet = async (req: MulterRequest, res: Response) => {
  try {
    const { coin, address, network } = req.body;

    if (!isValidCoin(coin)) {
      return res.status(400).json({ success: false, message: "Invalid coin type" });
    }

    if (!isValidNetwork(network)) {
      return res.status(400).json({ success: false, message: "Invalid network type" });
    }

    if (!address) {
      return res.status(400).json({ success: false, message: "Wallet address required" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "QR image required" });
    }

    const wallet = await prisma.depositWallet.upsert({
      where: {
        coin_network: { coin, network },
      },
      update: {
        address,
        qrImage: `uploads/qr/${req.file.filename}`,
      },
      create: {
        coin,
        network,
        address,
        qrImage: `uploads/qr/${req.file.filename}`,
      },
    });

    return res.status(200).json({
      success: true,
      message: `${coin} (${network}) wallet saved successfully`,
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

export const getAllDepositWallets = async (req: AuthRequest, res: Response) => {
  try {
    // Fetch all wallets from DB
    const wallets = await prisma.depositWallet.findMany({
      orderBy: [
        { coin: "asc" },
        { network: "asc" },
      ],
    });

    // Map QR image URLs
    const walletsWithUrl = wallets.map(w => ({
      id: w.id,
      coin: w.coin,
      network: w.network,
      address: w.address,
      qrImage: w.qrImage ? getQrUrl(req, w.qrImage) : null,
      isActive: w.isActive,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    }));

    // Optionally, group by coin for frontend convenience
    const groupedByCoin: Record<string, typeof walletsWithUrl> = {};
    walletsWithUrl.forEach(wallet => {
      if (!groupedByCoin[wallet.coin]) groupedByCoin[wallet.coin] = [];
      groupedByCoin[wallet.coin].push(wallet);
    });

    // Disable caching
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    return res.status(200).json({
      success: true,
      count: walletsWithUrl.length,
      data: groupedByCoin, // grouped by coin, each coin contains an array of networks
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
    const coin = req.params.coin;
    const network = req.params.network;
    const { address } = req.body;

    if (!isValidCoin(coin)) {
      return res.status(400).json({ success: false, message: "Invalid coin type" });
    }

    if (!isValidNetwork(network)) {
      return res.status(400).json({ success: false, message: "Invalid network type" });
    }

    const wallet = await prisma.depositWallet.findUnique({
      where: { coin_network: { coin, network } },
    });

    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }

    const updated = await prisma.depositWallet.update({
      where: { coin_network: { coin, network } },
      data: {
        address: address ?? wallet.address,
      },
    });

    return res.status(200).json({
      success: true,
      message: `${coin} (${network}) updated successfully`,
      data: updated,
    });
  } catch (error) {
    console.error("Edit Wallet Error:", error);
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

    const formatted = formatDeposit(req, deposit);

    return res.status(200).json({ success: true, data: formatted });
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

    const formatted = deposits.map(d => formatDeposit(req, d));

    return res.status(200).json({ success: true, data: formatted });
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
/**
 * ===============================
 * ADMIN: Get Pending Deposits
 * ===============================
 */
export const getPendingDeposits = async (req: AuthRequest, res: Response) => {
  try {
    const deposits = await prisma.depositRequest.findMany({
      where: { status: DepositStatus.PENDING },
      include: { user: true, wallet: true },
      orderBy: { createdAt: "desc" },
    });

    const formatted = deposits.map(d => formatDeposit(req, d));

    return res.status(200).json({ success: true, data: formatted });
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
    const coin = req.params.coin;
    const network = req.params.network;

    if (!isValidCoin(coin)) {
      return res.status(400).json({ success: false, message: "Invalid coin type" });
    }

    if (!isValidNetwork(network)) {
      return res.status(400).json({ success: false, message: "Invalid network type" });
    }

    await prisma.depositWallet.delete({
      where: { coin_network: { coin, network } },
    });

    return res.status(200).json({
      success: true,
      message: `${coin} (${network}) deleted successfully`,
    });
  } catch (error) {
    console.error("Delete Wallet Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};