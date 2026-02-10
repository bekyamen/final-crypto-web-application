import { PrismaClient, TradeType, TradeStatus, TradeOutcome } from '@prisma/client';
import { cryptoPriceService } from './cryptoPriceService';
import { ValidationError } from '../utils/errors';

const prisma = new PrismaClient();

interface ScheduleTradeInput {
  userId: string;
  type: TradeType;
  cryptoSymbol: string;
  amountUSD: number;
  scheduledTime: Date;
}

interface ExecuteTradeResult {
  tradeId: string;
  status: TradeStatus;
  outcome: TradeOutcome | null;
  profitLoss: number | null;
  profitLossPercent: number | null;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
}

class TradingService {
  async scheduleTrade(input: ScheduleTradeInput): Promise<any> {
    const { userId, type, cryptoSymbol, amountUSD, scheduledTime } = input;

    // Validate amount
    const settings = await prisma.tradingSettings.findFirst();
    if (settings) {
      if (amountUSD < settings.minTradeAmount || amountUSD > settings.maxTradeAmount) {
        throw new ValidationError(
          `Trade amount must be between ${settings.minTradeAmount} and ${settings.maxTradeAmount}`,
        );
      }
    }

    // Get current price
    const priceData = await cryptoPriceService.getCryptoPrice(cryptoSymbol);
    const entryPrice = priceData.price;
    const quantity = amountUSD / entryPrice;

    // Create trade record
    const trade = await prisma.trade.create({
      data: {
        userId,
        type,
        cryptoSymbol,
        amountUSD,
        quantity,
        entryPrice,
        scheduledTime,
        status: TradeStatus.SCHEDULED,
      },
    });

    return trade;
  }

  async executeTrade(tradeId: string, forceOutcome?: TradeOutcome): Promise<ExecuteTradeResult> {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: { user: true },
    });

    if (!trade) {
      throw new ValidationError('Trade not found');
    }

    if (trade.status === TradeStatus.EXECUTED) {
      throw new ValidationError('Trade already executed');
    }

    if (trade.status === TradeStatus.CANCELLED) {
      throw new ValidationError('Trade is cancelled');
    }

    try {
      // Get current price
      const priceData = await cryptoPriceService.getCryptoPrice(trade.cryptoSymbol);
      const exitPrice = priceData.price;

      // Determine outcome
      let outcome: TradeOutcome;
      if (forceOutcome) {
        outcome = forceOutcome;
      } else {
        outcome = await this.determineTradeOutcome();
      }

      // Calculate profit/loss
      const { profitLoss, profitLossPercent } = this.calculateProfitLoss(
        trade.entryPrice!,
        exitPrice,
        trade.amountUSD,
        outcome,
      );

      // Update user balance
      const newBalance = trade.user.balance + profitLoss;
      const newEarnings = trade.user.totalEarnings + profitLoss;

      await prisma.user.update({
        where: { id: trade.userId },
        data: {
          balance: newBalance,
          totalEarnings: newEarnings,
        },
      });

      // Update or create user wallet
      if (trade.type === TradeType.BUY) {
        await this.updateUserWallet(trade.userId, trade.cryptoSymbol, trade.quantity!, trade.entryPrice!);
      }

      // Update trade record
      const updatedTrade = await prisma.trade.update({
        where: { id: tradeId },
        data: {
          status: TradeStatus.EXECUTED,
          executedAt: new Date(),
          exitPrice,
          outcome,
          profitLoss,
          profitLossPercent,
        },
      });

      // Create execution log
      await prisma.tradeExecution.create({
        data: {
          tradeId,
          status: 'SUCCESS',
          priceAtExecution: exitPrice,
          calculatedOutcome: outcome,
        },
      });

      return {
        tradeId: updatedTrade.id,
        status: updatedTrade.status,
        outcome: updatedTrade.outcome,
        profitLoss,
        profitLossPercent,
        entryPrice: trade.entryPrice!,
        exitPrice,
        quantity: trade.quantity!,
      };
    } catch (error) {
      // Log execution failure
      await prisma.tradeExecution.create({
        data: {
          tradeId,
          status: 'FAILED',
          reason: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      // Update trade status to failed
      await prisma.trade.update({
        where: { id: tradeId },
        data: { status: TradeStatus.FAILED },
      });

      throw error;
    }
  }

  private async determineTradeOutcome(): Promise<TradeOutcome> {
    const settings = await prisma.tradingSettings.findFirst();

    if (!settings || !settings.useRandomOutcome) {
      return TradeOutcome.NEUTRAL;
    }

    const random = Math.random() * 100;

    if (random < settings.winPercentage) {
      return TradeOutcome.WIN;
    } else if (random < settings.winPercentage + settings.lossPercentage) {
      return TradeOutcome.LOSS;
    }

    return TradeOutcome.NEUTRAL;
  }

  private calculateProfitLoss(
    entryPrice: number,
    exitPrice: number,
    amountUSD: number,
    outcome: TradeOutcome,
  ): { profitLoss: number; profitLossPercent: number } {
    let priceDiff = exitPrice - entryPrice;

    // Apply outcome logic
    if (outcome === TradeOutcome.WIN) {
      // Win: price goes up by 1-3%
      const winPercent = Math.random() * 2 + 1; // 1-3%
      priceDiff = (entryPrice * winPercent) / 100;
    } else if (outcome === TradeOutcome.LOSS) {
      // Loss: price goes down by 1-3%
      const lossPercent = -(Math.random() * 2 + 1); // -1 to -3%
      priceDiff = (entryPrice * lossPercent) / 100;
    } else {
      // Neutral: 0% change
      priceDiff = 0;
    }

    const profitLossPercent = (priceDiff / entryPrice) * 100;
    const profitLoss = (amountUSD * profitLossPercent) / 100;

    return {
      profitLoss,
      profitLossPercent,
    };
  }

  private async updateUserWallet(userId: string, cryptoSymbol: string, quantity: number, buyPrice: number): Promise<void> {
    const existingWallet = await prisma.userWallet.findUnique({
      where: {
        userId_cryptoSymbol: {
          userId,
          cryptoSymbol,
        },
      },
    });

    if (existingWallet) {
      const totalInvested = existingWallet.totalInvested + quantity * buyPrice;
      const newQuantity = existingWallet.quantity + quantity;
      const newAverageBuyPrice = totalInvested / newQuantity;

      await prisma.userWallet.update({
        where: {
          userId_cryptoSymbol: {
            userId,
            cryptoSymbol,
          },
        },
        data: {
          quantity: newQuantity,
          averageBuyPrice: newAverageBuyPrice,
          totalInvested,
        },
      });
    } else {
      await prisma.userWallet.create({
        data: {
          userId,
          cryptoSymbol,
          quantity,
          averageBuyPrice: buyPrice,
          totalInvested: quantity * buyPrice,
        },
      });
    }
  }

  async getTradeHistory(userId: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    return prisma.trade.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async getUserWallets(userId: string): Promise<any[]> {
    return prisma.userWallet.findMany({
      where: { userId },
    });
  }

  async getTradeStats(userId: string): Promise<any> {
    const trades = await prisma.trade.findMany({
      where: { userId, status: TradeStatus.EXECUTED },
    });

    const totalTrades = trades.length;
    const winTrades = trades.filter(t => t.outcome === TradeOutcome.WIN).length;
    const lossTrades = trades.filter(t => t.outcome === TradeOutcome.LOSS).length;
    const totalProfit = trades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);

    return {
      totalTrades,
      winTrades,
      lossTrades,
      neutralTrades: totalTrades - winTrades - lossTrades,
      winRate: totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0,
      totalProfit,
      averageProfit: totalTrades > 0 ? totalProfit / totalTrades : 0,
    };
  }
}

export const tradingService = new TradingService();
export type { ScheduleTradeInput, ExecuteTradeResult };
