import { Router } from 'express';
import { adminSimController } from '../controllers/adminSimController';

export const adminSimRouter = Router();

// Existing routes
adminSimRouter.post('/mode', adminSimController.setGlobalMode);
adminSimRouter.post('/win-probability', adminSimController.setWinProbability);
adminSimRouter.post('/user-override', adminSimController.setUserOverride);
adminSimRouter.post('/bet-config', adminSimController.updateBetConfig);
adminSimRouter.get('/settings', adminSimController.getSettings);
adminSimRouter.get('/stats', adminSimController.getAdminStats);
adminSimRouter.post('/reset', adminSimController.resetData);

// NEW route
adminSimRouter.get('/users', adminSimController.getUsersWithMode);

export default adminSimRouter;
