import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { tradeEngine } from '../services/tradeEngine';
import { AdminMode, AdminSettings, UserOverride } from '../types/trade.types';

export class AdminUsersController {
  /**
   * GET /api/admin/users-with-mode
   * Returns all users with their active override mode or global mode if none
   */
  getUsersWithMode = async (_req: Request, res: Response) => {
    try {
      // Fetch all users + overrides
      const users = await prisma.user.findMany({ include: { userOverrides: true } });

      const adminSettings: AdminSettings = tradeEngine.getAdminSettings();

      const mapped = users.map(user => {
        // Check for override on REAL trades
        const override = user.userOverrides?.find(
          (o: any) => o.tradeType === 'REAL'
        ) as (UserOverride & { tradeType: string }) | undefined;

        let mode: 'win' | 'lose' | 'random' = 'random';

        if (override?.forceOutcome) {
          // Fix: Compare with the correct enum values
          mode = override.forceOutcome === 'win' ? 'win' : 'lose';
        } else {
          // Use the correct property name - REAL (uppercase)
          const gm: AdminMode = adminSettings.REAL.globalMode; // Changed from adminSettings[typeKey]

          if (gm === 'WIN') mode = 'win';
          else if (gm === 'LOSS') mode = 'lose';
          else mode = 'random';
        }

        return { ...user, mode };
      });

      res.json({ success: true, data: { users: mapped } });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Server error',
      });
    }
  };
}

export const adminUsersController = new AdminUsersController();