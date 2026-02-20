import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { tradeEngine } from '../services/tradeEngine';

const ALLOWED_EXPIRATION_TIMES = [30, 60, 120, 180, 240, 300, 360];

class AdminSimController {
  /** ==================== EXISTING METHODS ==================== */
  setGlobalMode = (req: Request, res: Response): void => {
    const { mode } = req.body;
    if (!mode || !['win', 'lose', 'random'].includes(mode)) {
      res.status(400).json({ success: false, message: 'Invalid mode' });
      return;
    }
    tradeEngine.setGlobalMode(mode);
    res.json({ success: true, message: `Global mode set to ${mode}`, data: { mode, timestamp: new Date() } });
  };

  setWinProbability = (req: Request, res: Response): void => {
    const { percentage } = req.body;
    if (percentage < 0 || percentage > 100) {
      res.status(400).json({ success: false, message: 'Percentage must be 0-100' });
      return;
    }
    tradeEngine.setWinProbability(percentage);
    res.json({ success: true, message: `Win probability set to ${percentage}%`, data: { winProbability: percentage } });
  };

  setUserOverride = async (req: Request, res: Response) => {
  try {
    const { userId, forceOutcome } = req.body;

    if (!userId || (forceOutcome !== null && !['win', 'lose'].includes(forceOutcome))) {
      res.status(400).json({ success: false, message: 'Invalid user override' });
      return;
    }

    await tradeEngine.setUserOverride(userId, forceOutcome);

    res.json({
      success: true,
      message: forceOutcome
        ? `User ${userId} override set to ${forceOutcome}`
        : `User ${userId} override removed`,
      data: { userId, forceOutcome, timestamp: new Date() },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err instanceof Error ? err.message : 'Unknown error' });
  }
};


  updateBetConfig = (req: Request, res: Response): void => {
    const { expirationTime, profitPercent, lossPercent } = req.body;
    if (!ALLOWED_EXPIRATION_TIMES.includes(expirationTime)) {
      res.status(400).json({ success: false, message: 'Invalid expirationTime' });
      return;
    }
    tradeEngine.updateBetConfig(expirationTime, profitPercent, lossPercent);
    res.json({ success: true, message: `Bet config updated`, data: { expirationTime, profitPercent, lossPercent } });
  };

  getSettings = (_req: Request, res: Response): void => {
    const settings = tradeEngine.getAdminSettings();
    res.json({ success: true, message: 'Admin settings retrieved', data: settings });
  };

  getAdminStats = (_req: Request, res: Response): void => {
    const stats = tradeEngine.getStats();
    res.json({ success: true, message: 'Admin stats retrieved', data: stats });
  };

  resetData = (req: Request, res: Response): void => {
    const { confirmation } = req.body;
    if (confirmation !== 'RESET_ALL_DATA') {
      res.status(400).json({ success: false, message: 'Invalid confirmation string' });
      return;
    }
    tradeEngine.reset();
    res.json({ success: true, message: 'All data reset', data: { timestamp: new Date() } });
  };

  /** ==================== NEW: GET USERS WITH MODE ==================== */
  /** ==================== NEW: GET USERS WITH MODE ==================== */
getUsersWithMode = async (_req: Request, res: Response) => {
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
        userOverride: true, // ✅ Correct relation name
      },
      orderBy: { email: 'asc' },
    });

    // Map users to include active override mode
   const mappedUsers = users.map(user => {
  let mode: 'win' | 'lose' | 'random' = 'random';

  if (user.userOverride) {
    // Apply override directly (no expiresAt anymore)
    mode = user.userOverride.forceOutcome as 'win' | 'lose';
  } else {
    // Fallback to global mode
    const globalMode = tradeEngine.getAdminSettings().globalMode;
    mode = ['win', 'lose', 'random'].includes(globalMode)
      ? (globalMode as 'win' | 'lose' | 'random')
      : 'random';
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
    mode,
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
    res.status(500).json({
      success: false,
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};
}

export const adminSimController = new AdminSimController();
