// src/routes/tradeSimRouter.ts
import { Router } from 'express'
import { tradeSimController } from '../controllers/tradeSimController'

export const tradeSimRouter = Router()

// execute trade
tradeSimRouter.post('/', tradeSimController.createTrade)

// user trades
tradeSimRouter.get('/user/:userId', tradeSimController.getUserTrades)

// all trades
tradeSimRouter.get('/', tradeSimController.getAllTrades)

// statistics
tradeSimRouter.get('/stats', tradeSimController.getStats)

export default tradeSimRouter