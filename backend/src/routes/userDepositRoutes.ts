import express from "express";
import { getDepositWallet, createDepositRequest } from "../controllers/userDeposit.controller";
import { upload } from "../middlewares/upload";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// Get wallet info
router.get("/deposit/wallet/:coin", authMiddleware, getDepositWallet);

// Create deposit with proof image
router.post(
  "/deposit/create",
  authMiddleware,
  upload.single("proofImage"),
  createDepositRequest
);

export default router;