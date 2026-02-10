import { Router } from 'express';
import { transactionController } from '../controllers/transactionController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/errorMiddleware';

const transactionRouter = Router();

// All transaction routes require authentication
transactionRouter.use(authMiddleware);

/**
 * @route POST /api/transactions
 * @desc Create a new transaction
 * @body {coinId: string, type: string, quantity: number, price: number, fee?: number, notes?: string}
 * @returns {created transaction}
 */
transactionRouter.post(
  '/',
  asyncHandler((req, res) => transactionController.createTransaction(req, res)),
);

/**
 * @route GET /api/transactions
 * @desc Get all transactions for user
 * @query {limit?: number, offset?: number}
 * @returns {transactions array with pagination}
 */
transactionRouter.get(
  '/',
  asyncHandler((req, res) => transactionController.getTransactions(req, res)),
);

/**
 * @route GET /api/transactions/coin/:coinId
 * @desc Get transactions for specific coin
 * @returns {transactions array}
 */
transactionRouter.get(
  '/coin/:coinId',
  asyncHandler((req, res) => transactionController.getTransactionsByCoin(req, res)),
);

/**
 * @route GET /api/transactions/stats
 * @desc Get transaction statistics
 * @returns {transaction stats}
 */
transactionRouter.get(
  '/stats',
  asyncHandler((req, res) => transactionController.getTransactionStats(req, res)),
);

/**
 * @route DELETE /api/transactions/:transactionId
 * @desc Delete a transaction
 * @returns {message}
 */
transactionRouter.delete(
  '/:transactionId',
  asyncHandler((req, res) => transactionController.deleteTransaction(req, res)),
);

export default transactionRouter;
