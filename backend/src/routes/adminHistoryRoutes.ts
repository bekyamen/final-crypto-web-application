import express from "express";
import { getAddBalanceHistory } from "../controllers/adminHistoryController";
import { authMiddleware, roleMiddleware } from "../middlewares/authMiddleware";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get(
  "/balance-history",
  authMiddleware,
  roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  getAddBalanceHistory
);

export default router;
