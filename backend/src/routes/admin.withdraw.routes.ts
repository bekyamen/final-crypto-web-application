import express from "express";
import {
  getPendingWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
} from "../controllers/withdraw.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// All admin routes require SUPER_ADMIN
router.use(authMiddleware);
router.use(roleMiddleware(["SUPER_ADMIN"]));

// GET /api/admin/withdraw/pending
router.get("/pending", getPendingWithdrawals);

// PUT /api/admin/withdraw/approve/:id
router.put("/approve/:id", approveWithdrawal);

// PUT /api/admin/withdraw/reject/:id
router.put("/reject/:id", rejectWithdrawal);

export default router;
