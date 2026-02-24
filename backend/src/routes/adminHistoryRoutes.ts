import express from "express";
import { getDemoBalanceHistory } from "../controllers/adminHistoryController";
import { authMiddleware, roleMiddleware } from "../middlewares/authMiddleware";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get(
  "/demo-balance-history",
  authMiddleware,
  roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  getDemoBalanceHistory
);

export default router;