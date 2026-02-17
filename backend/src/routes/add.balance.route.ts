import express from "express";
import { setDemoBalanceForAllUsers } from "../controllers/Add Balance Controller";
import { authMiddleware, roleMiddleware } from "../middlewares/authMiddleware";
import { UserRole } from "@prisma/client";

const router = express.Router();

/**
 * @route POST /users/demo-balance/all
 * @desc  Admin sets or adds demo balance for all users
 * @body  { amount: number, reason?: string, mode: "add" | "set" }
 * @access Admin / Super Admin
 */
router.post(
  "/users/demo-balance/all",
  authMiddleware,
  roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  setDemoBalanceForAllUsers
);

export default router;
