import express from "express";
import {
  setDepositWallet,
  getPendingDeposits,
  approveDeposit,
  rejectDeposit
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
 * GET all pending deposits
 */
router.get(
  "/pending",
  getPendingDeposits
);

/**
 * Approve deposit
 */
router.put(
  "/approve/:id",
  approveDeposit
);

/**
 * Reject deposit
 */
router.put(
  "/reject/:id",
  rejectDeposit
);

export default router;
