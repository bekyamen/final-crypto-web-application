import express from "express";
import { getUserBalance } from "../controllers/getUserBalance"; // create this file
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// User fetches their own balance
router.get("/users/balance", authMiddleware, getUserBalance);

export default router;
