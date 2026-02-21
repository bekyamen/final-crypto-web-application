// routes/userDeposit.routes.ts
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/upload"; // Multer setup
import { createDepositRequest, getDepositWallet } from "../controllers/userDeposit.controller";

const router = express.Router();

router.use(authMiddleware);

// Get deposit wallet info
router.get("/deposit/wallet/:coin", getDepositWallet);

// Create deposit request with proof image
router.post("/deposit/create", upload.single("proofImage"), createDepositRequest);

export default router;