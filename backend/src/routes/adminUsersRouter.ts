import { Router } from 'express';
import { adminUsersController } from '../controllers/adminUsersController';

const router = Router();

// GET all users with override mode
router.get('/users-with-mode', adminUsersController.getUsersWithMode);

export default router;