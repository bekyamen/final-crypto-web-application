import express from "express";
import {
  getDepositWallet,
  createDepositRequest,
} from "../controllers/deposit.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/upload";

const router = express.Router();

router.get("/wallet/:coin", authMiddleware, getDepositWallet);
router.post("/request", authMiddleware, upload.single("proofImage"), createDepositRequest);

export default router;

