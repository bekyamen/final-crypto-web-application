import { Response } from 'express';
import { authService } from '../services/authService';
import { AuthRequest } from '../middlewares/authMiddleware';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  changeFundsPasswordSchema,
} from '../validations/authValidation';
import { createSuccessResponse } from '../utils/errors';

export class AuthController {
  async register(req: AuthRequest, res: Response): Promise<void> {
    const validatedData = registerSchema.parse(req.body);
    const result = await authService.register(validatedData);

    res.status(201).json(
      createSuccessResponse(result, 'User registered successfully'),
    );
  }

  async login(req: AuthRequest, res: Response): Promise<void> {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.login(validatedData);

    res.status(200).json(
      createSuccessResponse(result, 'Login successful'),
    );
  }

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized', errorCode: 'UNAUTHORIZED' });
      return;
    }

    const user = await authService.getUserProfile(userId);

    res.status(200).json(createSuccessResponse(user, 'Profile retrieved successfully'));
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized', errorCode: 'UNAUTHORIZED' });
      return;
    }

    const validatedData = updateProfileSchema.parse(req.body);
    const updatedUser = await authService.updateProfile(userId, validatedData);

    res.status(200).json(createSuccessResponse(updatedUser, 'Profile updated successfully'));
  }

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized', errorCode: 'UNAUTHORIZED' });
      return;
    }

    const validatedData = changePasswordSchema.parse(req.body);
    const result = await authService.changePassword(userId, validatedData);

    res.status(200).json(createSuccessResponse(result, 'Password changed successfully'));
  }

  async changeFundsPassword(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized', errorCode: 'UNAUTHORIZED' });
      return;
    }

    const validatedData = changeFundsPasswordSchema.parse(req.body);
    const result = await authService.changeFundsPassword(userId, validatedData);

    res.status(200).json(createSuccessResponse(result, 'Funds password changed successfully'));
  }

  async verifyFundsPassword(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized', errorCode: 'UNAUTHORIZED' });
      return;
    }

    const { fundsPassword } = req.body;

    if (!fundsPassword) {
      res.status(400).json({ success: false, message: 'Funds password is required', errorCode: 'VALIDATION_ERROR' });
      return;
    }

    const isValid = await authService.verifyFundsPassword(userId, fundsPassword);

    res.status(200).json(createSuccessResponse({ isValid }, 'Funds password verified'));
  }

  // --- New: Reset Admin Password ---
}

export const authController = new AuthController();
