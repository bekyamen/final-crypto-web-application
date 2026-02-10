import { Response } from 'express';
import { transactionService } from '../services/transactionService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { createTransactionSchema } from '../validations/portfolioValidation';
import { createSuccessResponse } from '../utils/errors';

export class TransactionController {
  async createTransaction(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
      return;
    }

    const validatedData = createTransactionSchema.parse(req.body);
    const transaction = await transactionService.createTransaction(userId, validatedData);

    res.status(201).json(
      createSuccessResponse(transaction, 'Transaction created successfully'),
    );
  }

  async getTransactions(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
      return;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const result = await transactionService.getTransactions(userId, limit, offset);

    res.status(200).json(
      createSuccessResponse(result, 'Transactions retrieved successfully'),
    );
  }

  async getTransactionsByCoin(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { coinId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
      return;
    }

    const transactions = await transactionService.getTransactionsByCoin(userId, coinId);

    res.status(200).json(
      createSuccessResponse(transactions, 'Transactions retrieved successfully'),
    );
  }

  async getTransactionStats(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
      return;
    }

    const stats = await transactionService.getTransactionStats(userId);

    res.status(200).json(
      createSuccessResponse(stats, 'Transaction stats retrieved successfully'),
    );
  }

  async deleteTransaction(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { transactionId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
      return;
    }

    const result = await transactionService.deleteTransaction(userId, transactionId);

    res.status(200).json(
      createSuccessResponse(result, 'Transaction deleted successfully'),
    );
  }
}

export const transactionController = new TransactionController();
