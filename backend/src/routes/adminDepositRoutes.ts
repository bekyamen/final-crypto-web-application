import express from "express";
import { upload } from "../middlewares/upload";
import { authMiddleware, roleMiddleware } from "../middlewares/authMiddleware";

import {
  setDepositWallet,
  getAllDepositWallets,
  editDepositWallet,
  deleteDepositWallet,
  getPendingDeposits,
  approveDeposit,
  rejectDeposit,
  getDepositById,
  getDepositHistory,
} from "../controllers/deposit.controller";

const router = express.Router();

// All routes require valid JWT and SUPER_ADMIN role
router.use(authMiddleware);
router.use(roleMiddleware(["SUPER_ADMIN"]));

/**
 * Create or Update Deposit Wallet
 * POST /api/admin/deposit-wallet
 */
router.post(
  "/deposit-wallet",
  upload.single("qrImage"),
  setDepositWallet
);

/**
 * Get all created deposit wallets
 * GET /api/admin/deposit/wallets
 */
router.get("/wallets", getAllDepositWallets);

/**
 * ✅ Edit existing deposit wallet
 * MUST include coin + network
 * PUT /api/admin/deposit-wallet/:coin/:network
 */
router.put(
  "/deposit-wallet/:coin/:network",
  upload.single("qrImage"),
  editDepositWallet
);

/**
 * ✅ Delete deposit wallet
 * DELETE /api/admin/deposit-wallet/:coin/:network
 */
router.delete(
  "/deposit-wallet/:coin/:network",
  deleteDepositWallet
);

/**
 * Get all pending deposits
 */
router.get("/pending", getPendingDeposits);

/**
 * Approve deposit
 */
router.put("/approve/:id", approveDeposit);

/**
 * Reject deposit
 */
router.put("/reject/:id", rejectDeposit);

/**
 * Get a single deposit by ID
 */
router.get("/get/:id", getDepositById);

/**
 * Get deposit history
 */
router.get("/history", getDepositHistory);

export default router;