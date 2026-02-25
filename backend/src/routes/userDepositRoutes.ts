import express from "express";
import {
  getDepositWallet,
  createDepositRequest,
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