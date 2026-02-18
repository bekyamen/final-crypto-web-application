import { Request, Response } from 'express';
import { tradeEngine } from '../services/tradeEngine';

const ALLOWED_EXPIRATION_TIMES = [30, 60, 120, 180, 240, 300, 360];


class AdminSimController {
  setGlobalMode = (req: Request, res: Response): void => {
    try {
      const { mode } = req.body;

      if (!mode || !['win', 'lose', 'random'].includes(mode)) {
        res.status(400).json({
          success: false,
          message: 'Invalid mode. Must be "win", "lose", or "random"',
        });
        return;
      }



      tradeEngine.setGlobalMode(mode);

      res.status(200).json({
        success: true,
        message: `Global mode set to ${mode}`,
        data: { mode, timestamp: new Date() },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error setting global mode',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  setWinProbability = (req: Request, res: Response): void => {
    try {
      const { percentage } = req.body;

      if (percentage === undefined || percentage === null) {
        res.status(400).json({
          success: false,
          message: 'Win probability percentage is required',
        });
        return;
      }

      if (percentage < 0 || percentage > 100) {
        res.status(400).json({
          success: false,
          message: 'Win probability must be between 0 and 100',
        });
        return;
      }

      tradeEngine.setWinProbability(percentage);

      res.status(200).json({
        success: true,
        message: `Win probability set to ${percentage}%`,
        data: { winProbability: percentage, timestamp: new Date() },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error setting win probability',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  setUserOverride = (req: Request, res: Response): void => {
    try {
      const { userId, forceOutcome, expiresAt } = req.body;

      if (!userId) {
        res.status(400).json({ success: false, message: 'userId is required' });
        return;
      }

      if (forceOutcome !== null && !['win', 'lose'].includes(forceOutcome)) {
        res.status(400).json({
          success: false,
          message:
            'Invalid forceOutcome. Must be "win", "lose", or null to remove override',
        });
        return;
      }

      const expiresAtDate = expiresAt ? new Date(expiresAt) : undefined;
      tradeEngine.setUserOverride(userId, forceOutcome, expiresAtDate);

      res.status(200).json({
        success: true,
        message: forceOutcome
          ? `User ${userId} override set to ${forceOutcome}`
          : `User ${userId} override removed`,
        data: { userId, forceOutcome, expiresAt: expiresAtDate, timestamp: new Date() },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error setting user override',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  updateBetConfig = (req: Request, res: Response): void => {
    try {
      const { expirationTime, profitPercent, lossPercent } = req.body;

      if (!expirationTime || !ALLOWED_EXPIRATION_TIMES.includes(expirationTime)) {
        res.status(400).json({
          success: false,
          message: `Invalid expirationTime. Must be one of ${ALLOWED_EXPIRATION_TIMES.join(
            ', '
          )}`,
        });
        return;
      }

      if (profitPercent === undefined || lossPercent === undefined) {
        res.status(400).json({
          success: false,
          message: 'profitPercent and lossPercent are required',
        });
        return;
      }

      if (profitPercent < 0 || lossPercent < 0) {
        res.status(400).json({
          success: false,
          message: 'Percentages cannot be negative',
        });
        return;
      }

      tradeEngine.updateBetConfig(expirationTime, profitPercent, lossPercent);

      res.status(200).json({
        success: true,
        message: `Bet config updated for ${expirationTime}s expiration`,
        data: { expirationTime, profitPercent, lossPercent, timestamp: new Date() },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating bet config',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  getSettings = (_req: Request, res: Response): void => {
    try {
      const settings = tradeEngine.getAdminSettings();

      res.status(200).json({
        success: true,
        message: 'Admin settings retrieved successfully',
        data: {
          globalMode: settings.globalMode,
          winProbability: settings.winProbability,
          userOverridesCount: settings.userOverrides.size,
          userOverrides: Array.from(settings.userOverrides.entries()).map(
            ([userId, override]) => ({
              userId,
              forceOutcome: override.forceOutcome,
              expiresAt: override.expiresAt,
            })
          ),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving settings',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  getAdminStats = (_req: Request, res: Response): void => {
    try {
      const stats = tradeEngine.getStats();
      const settings = tradeEngine.getAdminSettings();

      res.status(200).json({
        success: true,
        message: 'Admin statistics retrieved successfully',
        data: {
          statistics: stats,
          settings: {
            globalMode: settings.globalMode,
            winProbability: settings.winProbability,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving admin statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  resetData = (req: Request, res: Response): void => {
    try {
      const { confirmation } = req.body;

      if (confirmation !== 'RESET_ALL_DATA') {
        res.status(400).json({
          success: false,
          message:
            'Confirmation string is incorrect. Send: { "confirmation": "RESET_ALL_DATA" }',
        });
        return;
      }

      tradeEngine.reset();

      res.status(200).json({ success: true, message: 'All data has been reset', data: { timestamp: new Date() } });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error resetting data', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };
}

export const adminSimController = new AdminSimController();
 