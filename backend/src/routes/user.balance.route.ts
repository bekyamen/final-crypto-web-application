import express from "express";
import { getUserDemoBalance } from "../controllers/getUserBalance";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

/**
 * @route   GET /users/balance
 * @desc    Fetch logged-in user's demo balance
 * @access  Authenticated users
 */
router.get("/users/balance", authMiddleware, getUserDemoBalance);

export default router;
