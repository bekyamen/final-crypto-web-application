import express from "express";
import { getDemoBalanceHistory } from "../controllers/adminHistoryController";
import { authMiddleware, roleMiddleware } from "../middlewares/authMiddleware";
import { UserRole } from "@prisma/client";

const router = express.Router();

// 🔹 Demo balance history
router.get(
  "/demo-balance-history", // ✅ new endpoint
  authMiddleware,
  roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  getDemoBalanceHistory
);

export default router;
