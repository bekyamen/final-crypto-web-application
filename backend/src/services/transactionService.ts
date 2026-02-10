import { PrismaClient } from '@prisma/client';
import { cryptoService } from './cryptoService';
import { portfolioService } from './portfolioService';
import { NotFoundError } from '../utils/errors';
import { CreateTransactionInput } from '../validations/portfolioValidation';

const prisma = new PrismaClient();

export class TransactionService {
  async createTransaction(userId: string, input: CreateTransactionInput) {
    const { coinId, type, quantity, price, fee = 0, notes } = input;

    // Get coin data
    const coinData = await cryptoService.getCachedOrFetchCoin(coinId);

    const total = quantity * price + fee;

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        coinId,
        coinName: coinData.name,
        coinSymbol: coinData.symbol,
        type,
        quantity,
        price,
        total,
        fee,
        notes,
      },
    });

    // Update portfolio based on transaction type
    if (type === 'BUY' || type === 'DEPOSIT') {
      // Add to portfolio
      const portfolio = await prisma.portfolio.findUnique({
        where: { userId },
      });

      if (portfolio) {
        await portfolioService.addAsset(userId, {
          coinId,
          quantity,
          averageBuyPrice: price,
        });
      }
    } else if (type === 'SELL' || type === 'WITHDRAWAL') {
      // This should handle reducing portfolio holdings
      // In a real app, this would need to match with specific lots (FIFO/LIFO)
      const portfolio = await prisma.portfolio.findUnique({
        where: { userId },
        include: { assets: true },
      });

      if (portfolio) {
        const asset = portfolio.assets.find((a) => a.coinId === coinId);
        if (asset && asset.quantity >= quantity) {
          const newQuantity = asset.quantity - quantity;

          if (newQuantity === 0) {
            // Remove asset if quantity becomes 0
            await prisma.portfolioAsset.delete({
              where: { id: asset.id },
            });
          } else {
            // Update asset with reduced quantity
            await prisma.portfolioAsset.update({
              where: { id: asset.id },
              data: { quantity: newQuantity },
            });
          }

          await portfolioService.updatePortfolioTotals(portfolio.id);
        }
      }
    }

    return transaction;
  }

  async getTransactions(userId: string, limit: number = 50, offset: number = 0) {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.transaction.count({
      where: { userId },
    });

    return {
      transactions,
      total,
      limit,
      offset,
    };
  }

  async getTransactionsByCoin(userId: string, coinId: string) {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        coinId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return transactions;
  }

  async getTransactionStats(userId: string) {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
    });

    const stats = {
      totalTransactions: transactions.length,
      buyTransactions: transactions.filter((t) => t.type === 'BUY').length,
      sellTransactions: transactions.filter((t) => t.type === 'SELL').length,
      totalSpent: transactions
        .filter((t) => t.type === 'BUY' || t.type === 'DEPOSIT')
        .reduce((sum, t) => sum + t.total, 0),
      totalProceeds: transactions
        .filter((t) => t.type === 'SELL' || t.type === 'WITHDRAWAL')
        .reduce((sum, t) => sum + t.total, 0),
      totalFees: transactions.reduce((sum, t) => sum + t.fee, 0),
    };

    const coinStats: Record<string, any> = {};
    for (const transaction of transactions) {
      if (!coinStats[transaction.coinSymbol]) {
        coinStats[transaction.coinSymbol] = {
          coinSymbol: transaction.coinSymbol,
          coinName: transaction.coinName,
          totalBought: 0,
          totalSold: 0,
          transactions: 0,
        };
      }

      if (transaction.type === 'BUY' || transaction.type === 'DEPOSIT') {
        coinStats[transaction.coinSymbol].totalBought += transaction.quantity;
      } else if (transaction.type === 'SELL' || transaction.type === 'WITHDRAWAL') {
        coinStats[transaction.coinSymbol].totalSold += transaction.quantity;
      }

      coinStats[transaction.coinSymbol].transactions += 1;
    }

    return {
      ...stats,
      coinStats: Object.values(coinStats),
    };
  }

  async deleteTransaction(userId: string, transactionId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction || transaction.userId !== userId) {
      throw new NotFoundError('Transaction');
    }

    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    // TODO: Recalculate portfolio if needed
    return { message: 'Transaction deleted successfully' };
  }
}

export const transactionService = new TransactionService();
