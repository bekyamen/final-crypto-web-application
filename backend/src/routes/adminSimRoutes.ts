import { Router } from 'express';
import { adminSimController } from '../controllers/adminSimController';

export const adminSimRouter = Router();

/**
 * @route POST /api/admin/mode
 * @desc Set global admin mode (win, lose, random)
 * @body { mode: 'win' | 'lose' | 'random' }
 */
adminSimRouter.post('/mode', adminSimController.setGlobalMode);

/**
 * @route POST /api/admin/win-probability
 * @desc Set win probability for random mode (0-100)
 * @body { percentage: number }
 */
adminSimRouter.post('/win-probability', adminSimController.setWinProbability);

/**
 * @route POST /api/admin/user-override
 * @desc Force specific user to win or lose
 * @body { userId: string, forceOutcome: 'win' | 'lose' | null, expiresAt?: string }
 */
adminSimRouter.post('/user-override', adminSimController.setUserOverride);

/**
 * @route POST /api/admin/bet-config
 * @desc Update profit/loss percentages for specific expiration time
 * @body { expirationTime: 30 | 60 | 120 | 300, profitPercent: number, lossPercent: number }
 */
adminSimRouter.post('/bet-config', adminSimController.updateBetConfig);

/**
 * @route GET /api/admin/settings
 * @desc Get current admin settings
 */
adminSimRouter.get('/settings', adminSimController.getSettings);

/**
 * @route GET /api/admin/stats
 * @desc Get comprehensive admin statistics
 */
adminSimRouter.get('/stats', adminSimController.getAdminStats);

/**
 * @route POST /api/admin/reset
 * @desc Reset all data (development only)
 * @body { confirmation: 'RESET_ALL_DATA' }
 */
adminSimRouter.post('/reset', adminSimController.resetData);

export default adminSimRouter;
