import express from "express";

import {
  createWithdrawRequest,
  approveWithdraw,
  rejectWithdraw,
  getUserWithdraws,
  getUserWithdrawById,
  getAllWithdraws,
  getPendingWithdraws,
 getWithdrawalHistory,
} from "../controllers/withdrawController";

import { authMiddleware, roleMiddleware } from "../middlewares/authMiddleware";

import { UserRole } from "@prisma/client";

const router = express.Router();

/**
 * ================================
 * USER ROUTES
 * ================================
 */

// Create withdraw
router.post("/", authMiddleware, createWithdrawRequest);

// Get my withdraw history
router.get("/my", authMiddleware, getUserWithdraws);

// Get single withdraw (my own)
router.get("/my/:id", authMiddleware, getUserWithdrawById);

/**
 * ================================
 * ADMIN ROUTES
 * ================================
 */

// Get all withdraw requests
router.get(
  "/admin/all",
  authMiddleware,
  roleMiddleware([UserRole.SUPER_ADMIN]),
  getAllWithdraws
);

// Get only pending withdraw requests
router.get(
  "/admin/pending",
  authMiddleware,
  roleMiddleware([UserRole.SUPER_ADMIN]),
  getPendingWithdraws
);

// Approve
router.put(
  "/approve/:id",
  authMiddleware,
  roleMiddleware([UserRole.SUPER_ADMIN]),
  approveWithdraw
);

// Reject
router.put(
  "/reject/:id",
  authMiddleware,
  roleMiddleware([UserRole.SUPER_ADMIN]),
  rejectWithdraw
);

router.get(
  "/admin/history",
  authMiddleware,
   roleMiddleware([UserRole.SUPER_ADMIN]),
  getWithdrawalHistory
);

export default router;