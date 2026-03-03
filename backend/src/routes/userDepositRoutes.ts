import express from "express";
import {
  getDepositWallet,
  createDepositRequest,
  getDepositHistory,
  getTotalDeposits,
} from "../controllers/userDeposit.controller";
import { upload } from "../middlewares/upload";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

/**
 * Get Wallet by Coin + Network
 */
router.get(
  "/deposit/wallet/:coin/:network",
  authMiddleware,
  getDepositWallet
);

router.get("/deposit/history", authMiddleware, getDepositHistory);
router.get("/deposit/total", authMiddleware, getTotalDeposits);

/**
 * Create Deposit Request
 */
router.post(
  "/deposit/create",
  authMiddleware,
  upload.single("proofImage"),
  createDepositRequest
);

export default router;