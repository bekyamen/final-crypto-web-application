import express from "express";
import { addBalanceToAllUsers } from "../controllers/Add Balance Controller";
import { authMiddleware, roleMiddleware } from "../middlewares/authMiddleware";
import { UserRole } from "@prisma/client";

const router = express.Router();

// Add balance for a single user

// Add balance for all users
router.post(
  "/users/add-balance/all",
  authMiddleware,
  roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  addBalanceToAllUsers
);

export default router;






