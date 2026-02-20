import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { tradeAdminService } from '../services/tradeAdminService';
import { createSuccessResponse, ValidationError } from '../utils/errors';



import { TradeOutcome } from '@prisma/client';

class TradeAdminController {
  
  // src/controllers/tradeAdminController.ts
async adjustUserBalance(req: AuthRequest, res: Response): Promise<void> {
  const adminId = req.user?.id;
  if (!adminId || req.user?.role !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Forbidden' });
    return;
  }

  const { userId, amount, reason, mode } = req.body;

  if (!userId || amount === undefined || !reason) {
    throw new ValidationError('Missing required fields');
  }

  // Validate mode
  const validModes = ['set', 'add', 'deduct'] as const;
  if (!validModes.includes(mode)) {
    throw new ValidationError('Invalid mode. Must be "set", "add", or "deduct".');
  }

  const result = await tradeAdminService.adjustUserBalance({
    userId,
    amount,
    reason,
    adminId,
    mode,
  });

  res.status(200).json(createSuccessResponse(result, 'User balance adjusted'));
}

  async resetUserPassword(req: AuthRequest, res: Response): Promise<void> {
    const adminId = req.user?.id;
    if (!adminId || req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      throw new ValidationError('Missing required fields');

    }

    const result = await tradeAdminService.resetUserPassword(userId, newPassword, adminId);

    res.status(200).json(
      createSuccessResponse(result, 'Password reset successfully'),
    );
  }

  
  async getTradingSettings(req: AuthRequest, res: Response): Promise<void> {
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const settings = await tradeAdminService.getTradingSettings();

    res.status(200).json(
      createSuccessResponse(settings, 'Trading settings retrieved'),
    );
  }

  async updateTradingSettings(req: AuthRequest, res: Response): Promise<void> {
    const adminId = req.user?.id;
    if (!adminId || req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const settings = await tradeAdminService.updateTradingSettings(req.body, adminId);

    res.status(200).json(
      createSuccessResponse(settings, 'Trading settings updated'),
    );
  }

  async forceExecuteTrade(req: AuthRequest, res: Response): Promise<void> {
    const adminId = req.user?.id;
    if (!adminId || req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const { tradeId, outcome } = req.body;

    if (!tradeId || !outcome) {
      throw new ValidationError('Missing required fields');

    }

    if (!Object.values(TradeOutcome).includes(outcome)) {
     throw new ValidationError('Missing required fields');

    }

    const result = await tradeAdminService.forceExecuteTrade(tradeId, outcome, adminId);

    res.status(200).json(
      createSuccessResponse(result, 'Trade executed forcefully'),
    );
  }

  async cancelTrade(req: AuthRequest, res: Response): Promise<void> {
    const adminId = req.user?.id;
    if (!adminId || req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const { tradeId, reason } = req.body;

    if (!tradeId || !reason) {
      throw new ValidationError('Missing required fields');

    }

    const result = await tradeAdminService.cancelTrade(tradeId, adminId, reason);

    res.status(200).json(
      createSuccessResponse(result, 'Trade cancelled'),
    );
  }

  async getPlatformStats(req: AuthRequest, res: Response): Promise<void> {
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const stats = await tradeAdminService.getPlatformStats();

    res.status(200).json(
      createSuccessResponse(stats, 'Platform stats retrieved'),
    );
  }

  async getUserById(req: AuthRequest, res: Response): Promise<void> {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Forbidden' });
    return;
  }

  const { userId } = req.params;
  if (!userId) {
    throw new ValidationError('Missing required fields');

  }

  const user = await tradeAdminService.getUserById(userId);
  res.status(200).json(createSuccessResponse(user, 'User retrieved successfully'));
}


  async getUserStats(req: AuthRequest, res: Response): Promise<void> {
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const { userId } = req.params;

    const stats = await tradeAdminService.getUserStats(userId);

    res.status(200).json(
      createSuccessResponse(stats, 'User stats retrieved'),
    );
  }

  async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const { limit = 50, offset = 0 } = req.query;

    const result = await tradeAdminService.getAllUsers(
      parseInt(limit as string),
      parseInt(offset as string),
    );

    res.status(200).json(
      createSuccessResponse(result, 'All users retrieved'),
    );
  }


  // src/controllers/tradeAdminController.ts

async deleteUser(req: AuthRequest, res: Response): Promise<void> {
  const adminId = req.user?.id;
  if (!adminId || req.user?.role !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Forbidden' });
    return;
  }

  const { userId } = req.params;

  if (!userId) {
    throw new ValidationError('Missing required fields');

  }

  const result = await tradeAdminService.deleteUser(userId, adminId);

  res.status(200).json(createSuccessResponse(result, 'User deleted successfully'));
}



  async getAllTrades(req: AuthRequest, res: Response): Promise<void> {
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const { limit = 50, offset = 0 } = req.query;

    const result = await tradeAdminService.getAllTrades(
      parseInt(limit as string),
      parseInt(offset as string),
    );

    res.status(200).json(
      createSuccessResponse(result, 'All trades retrieved'),
    );
  }

  async getAuditLogs(req: AuthRequest, res: Response): Promise<void> {
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const { adminId, limit = 100, offset = 0 } = req.query;

    const logs = await tradeAdminService.getAuditLogs(
      adminId as string,
      parseInt(limit as string),
      parseInt(offset as string),
    );

    res.status(200).json(
      createSuccessResponse(logs, 'Audit logs retrieved'),
    );
  }
}

export const tradeAdminController = new TradeAdminController();
