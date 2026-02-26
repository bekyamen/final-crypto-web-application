import express from "express";
import multer from "multer";
import {
  submitVerification,
  getMyVerification,
  getPendingVerifications,
  reviewVerification,
  getReviewedVerifications,
} from "../controllers/identityVerificationController";
import { authMiddleware, roleMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// ------------------------------
// Multer memory storage
// ------------------------------
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ------------------------------
// USER routes
// ------------------------------
router.post(
  "/submit",
  authMiddleware,
  upload.fields([
    { name: "frontSide", maxCount: 1 },
    { name: "backSide", maxCount: 1 },
  ]),
  submitVerification
);

router.get("/me", authMiddleware, getMyVerification);

// ------------------------------
// ADMIN routes
// ------------------------------
router.get("/pending", authMiddleware, roleMiddleware(["SUPER_ADMIN"]), getPendingVerifications);
router.post("/review/:id", authMiddleware, roleMiddleware(["SUPER_ADMIN"]), reviewVerification);

router.get(
  "/history",
  authMiddleware,
  roleMiddleware(["SUPER_ADMIN"]),
  getReviewedVerifications
);

export default router;