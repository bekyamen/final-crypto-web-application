import { Request, Response } from 'express';
// 

import { tradeEngine } from '../services/tradeEngine';

const ALLOWED_EXPIRATION_TIMES = [30, 60, 120, 180, 240, 300, 360];

class AdminSimController {
  /** ==================== GLOBAL MODE ==================== */
  
   setGlobalMode = (req: Request, res: Response): void => {
  const { mode, tradeType } = req.body;

  if (!['win', 'lose', 'random'].includes(mode)) {
    res.status(400).json({ success: false, message: 'Invalid mode' });
    return;
  }

  const type = tradeType?.toUpperCase() === 'DEMO' ? 'DEMO' : 'REAL';

  tradeEngine.setGlobalMode(mode.toUpperCase(), type);

  res.json({
    success: true,
    message: `${type} global mode set to ${mode}`,
    data: { mode, tradeType: type },
  });
};

   

setWinProbability = (req: Request, res: Response): void => {
  const { percentage, tradeType } = req.body;

  if (percentage < 0 || percentage > 100) {
    res.status(400).json({ success: false, message: 'Percentage must be 0-100' });
    return;
  }

  const type = tradeType?.toUpperCase() === 'DEMO' ? 'DEMO' : 'REAL';

  tradeEngine.setWinProbability(percentage, type);

  res.json({
    success: true,
    message: `Win probability set to ${percentage}%`,
    data: { percentage, tradeType: type },
  });
};



  /** ==================== USER OVERRIDE ==================== */
  
   setUserOverride = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, forceOutcome, tradeType } = req.body;

    if (!userId || !['win', 'lose', 'random'].includes(forceOutcome)) {
      res.status(400).json({ success: false, message: 'Invalid user override' });
      return;
    }

    const type = tradeType?.toUpperCase() === 'DEMO' ? 'DEMO' : 'REAL';

    await tradeEngine.setUserOverride(
      userId,
      forceOutcome === 'random' ? null : forceOutcome,
      type
    );

    res.json({
      success: true,
      message:
        forceOutcome === 'random'
          ? `User ${userId} override removed`
          : `User ${userId} override set to ${forceOutcome}`,
      data: { userId, forceOutcome, tradeType: type },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

  /** ==================== BET CONFIG ==================== */
  updateBetConfig = (req: Request, res: Response): void => {
    const { expirationTime, profitPercent, lossPercent } = req.body;

    if (!ALLOWED_EXPIRATION_TIMES.includes(expirationTime)) {
      res.status(400).json({ success: false, message: 'Invalid expirationTime' });
      return;
    }

    tradeEngine.updateBetConfig(expirationTime, profitPercent, lossPercent);
    res.json({
      success: true,
      message: 'Bet config updated',
      data: { expirationTime, profitPercent, lossPercent },
    });
  };

  /** ==================== ADMIN SETTINGS ==================== */
   getSettings = (_req: Request, res: Response) => {

    const settings = tradeEngine.getAdminSettings()

    res.json({
      success:true,
      message:'Admin settings retrieved',
      data: settings
    })
  }

  /** ==================== ADMIN STATS ==================== */
  getAdminStats = (_req: Request, res: Response): void => {
    const stats = tradeEngine.getStats();
    res.json({ success: true, message: 'Admin stats retrieved', data: stats });
  };

  /** ==================== RESET ==================== */
   
  resetData = (req: Request, res: Response): void => {
  const { confirmation } = req.body;

  if (confirmation !== 'RESET_ALL_DATA') {
    res.status(400).json({ success: false, message: 'Invalid confirmation' });
    return;
  }

  tradeEngine.reset();

  res.json({
    success: true,
    message: 'All data reset',
  });
};

  /** ==================== GET USERS WITH ACTIVE MODE ==================== */
  
}



export const adminSimController = new AdminSimController();