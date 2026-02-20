// src/routes/tradeSimRouter.ts
import { Router } from 'express';
import { tradeSimController } from '../controllers/tradeSimController';

export const tradeSimRouter = Router();

tradeSimRouter.post('/', tradeSimController.createTrade);
tradeSimRouter.get('/user/:userId', tradeSimController.getUserTrades);
tradeSimRouter.get('/', tradeSimController.getAllTrades);
tradeSimRouter.get('/stats', tradeSimController.getStats);

export default tradeSimRouter;