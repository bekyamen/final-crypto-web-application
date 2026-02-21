import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import {
  createAdminOrSuperAdmin,
  getAdminHistory,
  resetAdminPassword,
  deactivateAdmin,
  activateAdmin,
  deleteAdmin,
} from '../controllers/superAdminController';

const router = express.Router();

/* ===============================
   CREATE ADMIN / SUPER ADMIN
================================ */
router.post(
  '/users',
  authMiddleware,
  roleMiddleware(['SUPER_ADMIN']),
  createAdminOrSuperAdmin
);

/* ===============================
   GET ADMINS (Dashboard)
================================ */
router.get(
  '/users',
  authMiddleware,
  roleMiddleware(['SUPER_ADMIN']),
  getAdminHistory
);

/* ===============================
   RESET PASSWORD
================================ */
router.post(
  '/users/:userId/reset-password',
  authMiddleware,
  roleMiddleware(['SUPER_ADMIN']),
  resetAdminPassword
);

/* ===============================
   DEACTIVATE (Soft Delete)
================================ */
router.put(
  '/users/:userId/deactivate',
  authMiddleware,
  roleMiddleware(['SUPER_ADMIN']),
  deactivateAdmin
);

/* ===============================
   ACTIVATE
================================ */
router.put(
  '/users/:userId/activate',
  authMiddleware,
  roleMiddleware(['SUPER_ADMIN']),
  activateAdmin
);

/* ===============================
   HARD DELETE (Optional)
================================ */
router.delete(
  '/users/:userId',
  authMiddleware,
  roleMiddleware(['SUPER_ADMIN']),
  deleteAdmin
);

export default router;