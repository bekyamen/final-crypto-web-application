import express from "express";
import { addDemoBalanceToAllUsers } from "../controllers/Add Balance Controller";
import { authMiddleware, roleMiddleware } from "../middlewares/authMiddleware";
import { UserRole } from "@prisma/client";

const router = express.Router();

// Add demo balance for all users
router.post(
  "/users/add-demo-balance/all",
  authMiddleware,
  roleMiddleware([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  addDemoBalanceToAllUsers
);

export default router;
