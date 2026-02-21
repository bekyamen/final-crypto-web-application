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
router.post("/deposit-wallet", upload.single("qrImage"), setDepositWallet);

/**
 * Get all created deposit wallets
 * GET /api/admin/deposit/wallets
 */
router.get("/wallets", getAllDepositWallets);

/**
 * Edit existing deposit wallet
 * PUT /api/admin/deposit-wallet/:coin
 */
router.put("/deposit-wallet/:coin", upload.single("qrImage"), editDepositWallet);

/**
 * Delete deposit wallet
 * DELETE /api/admin/deposit-wallet/:coin
 */
router.delete("/deposit-wallet/:coin", deleteDepositWallet);

/**
 * Get all pending deposits
 * GET /api/admin/deposit/pending
 */
router.get("/pending", getPendingDeposits);

/**
 * Approve deposit
 * PUT /api/admin/deposit/approve/:id
 */
router.put("/approve/:id", approveDeposit);

/**
 * Reject deposit
 * PUT /api/admin/deposit/reject/:id
 */
router.put("/reject/:id", rejectDeposit);

/**
 * Get a single deposit by ID
 * GET /api/admin/deposit/get/:id
 */
router.get("/get/:id", getDepositById);

/**
 * Get deposit history (all deposits or filtered)
 * Query params: userId, coin, status
 * GET /api/admin/deposit/history
 */
router.get("/history", getDepositHistory);

export default router;