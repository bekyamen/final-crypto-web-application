import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/asyncHandler';
import { userController } from '../controllers/trade userController';

const userRouter = Router();

/**
 * @route GET /api/user/me
 * @desc Get logged-in user's profile (including updated balance)
 */
userRouter.get(
  '/me',
  authMiddleware,
  asyncHandler((req, res) => userController.getMyProfile(req, res))
);

export default userRouter;

