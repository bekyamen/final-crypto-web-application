import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { createAdminOrSuperAdmin, resetAdminPassword } from '../controllers/superAdminController';

const router = express.Router();

// Create Admin / Super Admin
router.post(
  '/users',
  authMiddleware,
  roleMiddleware(['SUPER_ADMIN']),
  createAdminOrSuperAdmin
);

// Reset Admin password
router.post(
  '/users/:userId/reset-password',
  authMiddleware,
  roleMiddleware(['SUPER_ADMIN']),
  resetAdminPassword
);

export default router;
