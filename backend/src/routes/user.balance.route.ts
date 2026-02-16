import express from "express";
import { getUserDemoBalance } from "../controllers/getUserBalance"; 
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// User fetches their own demo balance
router.get("/users/balance", authMiddleware, getUserDemoBalance);

export default router;
