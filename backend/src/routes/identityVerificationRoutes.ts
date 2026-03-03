import express from "express";
import multer from "multer";
import {
  submitVerification,
  getMyVerification,
  getPendingVerifications,
  reviewVerification,
  getReviewedVerifications,
  submitLevel2Verification,
  getMyLevel2Verification,
  getLevel2History,
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

// Submit Level 2
router.post(
  "/level2/submit",
  authMiddleware,
  upload.fields([
    { name: "selfie", maxCount: 1 },
    { name: "proofOfAddress", maxCount: 1 },
  ]),
  submitLevel2Verification
);

// Get My Level 2
router.get(
  "/level2/me",
  authMiddleware,
  getMyLevel2Verification
);

/* =====================================================
   SUPER ADMIN ROUTES
===================================================== */

// Get Level 2 Full History
router.get(
  "/level2/history",
  authMiddleware,
  roleMiddleware(["SUPER_ADMIN"]),
  getLevel2History
);


export default router;