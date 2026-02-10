import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorMiddleware';

const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @body {
 *   firstName: string,
 *   lastName: string,
 *   email: string,
 *   phoneNumber: string,
 *   password: string,
 *   confirmPassword: string,
 *   fundsPassword: string
 * }
 * @returns {user, token, message}
 */
authRouter.post('/register', asyncHandler((req, res) => authController.register(req, res)));

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @body {email: string, password: string}
 * @returns {user, token}
 */
authRouter.post('/login', asyncHandler((req, res) => authController.login(req, res)));

/**
 * @route GET /api/auth/profile
 * @desc Get user profile (requires authentication)
 * @returns {user profile with portfolio info}
 */
authRouter.get(
  '/profile',
  authMiddleware,
  asyncHandler((req, res) => authController.getProfile(req, res)),
);

/**
 * @route PUT /api/auth/profile
 * @desc Update user profile
 * @body {firstName?: string, lastName?: string, email?: string, phoneNumber?: string}
 * @returns {updated user}
 */
authRouter.put(
  '/profile',
  authMiddleware,
  asyncHandler((req, res) => authController.updateProfile(req, res)),
);

/**
 * @route POST /api/auth/change-password
 * @desc Change user password
 * @body {currentPassword: string, newPassword: string, confirmNewPassword: string}
 * @returns {message}
 */
authRouter.post(
  '/change-password',
  authMiddleware,
  asyncHandler((req, res) => authController.changePassword(req, res)),
);

/**
 * @route POST /api/auth/change-funds-password
 * @desc Change user funds password (for transaction confirmations)
 * @body {currentFundsPassword: string, newFundsPassword: string, confirmFundsPassword: string}
 * @returns {message}
 */
authRouter.post(
  '/change-funds-password',
  authMiddleware,
  asyncHandler((req, res) => authController.changeFundsPassword(req, res)),
);

/**
 * @route POST /api/auth/verify-funds-password
 * @desc Verify funds password for transactions
 * @body {fundsPassword: string}
 * @returns {isValid: boolean}
 */
authRouter.post(
  '/verify-funds-password',
  authMiddleware,
  asyncHandler((req, res) => authController.verifyFundsPassword(req, res)),
);

export default authRouter;

