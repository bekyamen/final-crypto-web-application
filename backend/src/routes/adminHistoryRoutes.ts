import express from "express";
import { getAdminBalanceHistory } from "../controllers/getAdminBalanceHistory";
import { authMiddleware, roleMiddleware } from "../middlewares/authMiddleware";
import { UserRole } from "@prisma/client";

const router = express.Router();

// GET: Admin balance addition history
router.get(
  "/users/balance-history",
  authMiddleware,
  roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  getAdminBalanceHistory
);

export default router;
