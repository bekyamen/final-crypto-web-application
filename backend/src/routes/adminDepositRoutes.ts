import express from "express";


import {
  setDepositWallet,
  getPendingDeposits,
  approveDeposit,
  rejectDeposit,
  editDepositWallet,
   getDepositById,       // ← add this
  getDepositHistory,
  getAllDepositWallets ,
  deleteDepositWallet    // ← add this // ← imported new editDeposit controller
} from "../controllers/deposit.controller";
import { upload } from "../middlewares/upload";
import { authMiddleware, roleMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

/**
 * All routes below require:
 * - Valid JWT
 * - Role = SUPER_ADMIN
 */
router.use(authMiddleware);
router.use(roleMiddleware(["SUPER_ADMIN"]));

/**
 * Create or Update Deposit Wallet
 */
router.post(
  "/deposit-wallet",
  upload.single("qrImage"),
  setDepositWallet
);

/**
 * Get all created deposit wallets
 */
router.get("/wallets", getAllDepositWallets);


// Delete wallet
router.delete("/deposit-wallet/:coin", deleteDepositWallet);

/**
 * GET all pending deposits
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
 * Edit deposit (Admin)
 */
/**
 * Edit existing deposit wallet
 * PUT /api/admin/deposit-wallet/:coin
 */
router.put("/deposit-wallet/:coin", upload.single("qrImage"), editDepositWallet);

/**
 * Get a single deposit by ID
 */
router.get("/get/:id", getDepositById);

/**
 * Get deposit history (all deposits or filtered)
 * Query params: userId, coin, status
 */
router.get("/history", getDepositHistory);

export default router;