import express from "express";
import { createWithdrawRequest } from "../controllers/withdraw.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// POST /api/user/withdraw/request
router.post("/request", authMiddleware, createWithdrawRequest);

export default router;
