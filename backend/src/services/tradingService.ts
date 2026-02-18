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
  // Schedule a new trade
  async scheduleTrade(input: ScheduleTradeInput): Promise<any> {
    const { userId, type, cryptoSymbol, amountUSD, scheduledTime } = input;

    const settings = await prisma.tradingSettings.findFirst();
    if (settings) {
      if (amountUSD < settings.minTradeAmount || amountUSD > settings.maxTradeAmount) {
        throw new ValidationError(
          `Trade amount must be between ${settings.minTradeAmount} and ${settings.maxTradeAmount}`
        );
      }
    }

    const priceData = await cryptoPriceService.getCryptoPrice(cryptoSymbol);
    const entryPrice = priceData.price;
    const quantity = amountUSD / entryPrice;

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

  // Determine random trade outcome
  private async determineTradeOutcome(): Promise<TradeOutcome> {
    const settings = await prisma.tradingSettings.findFirst();

    if (!settings || !settings.useRandomOutcome) return TradeOutcome.NEUTRAL;

    const random = Math.random() * 100;

    if (random < settings.winPercentage) return TradeOutcome.WIN;
    if (random < settings.winPercentage + settings.lossPercentage) return TradeOutcome.LOSS;

    return TradeOutcome.NEUTRAL;
  }

  // Calculate profit/loss
  private calculateProfitLoss(
    entryPrice: number,
    exitPrice: number,
    amountUSD: number,
    outcome: TradeOutcome
  ): { profitLoss: number; profitLossPercent: number } {
    let priceDiff = exitPrice - entryPrice;

    if (outcome === TradeOutcome.WIN) {
      const winPercent = Math.random() * 2 + 1; // 1-3%
      priceDiff = (entryPrice * winPercent) / 100;
    } else if (outcome === TradeOutcome.LOSS) {
      const lossPercent = -(Math.random() * 2 + 1); // -1 to -3%
      priceDiff = (entryPrice * lossPercent) / 100;
    } else {
      priceDiff = 0;
    }

    const profitLossPercent = (priceDiff / entryPrice) * 100;
    const profitLoss = (amountUSD * profitLossPercent) / 100;

    return { profitLoss, profitLossPercent };
  }

  // Update user wallet
  private async updateUserWallet(
    userId: string,
    cryptoSymbol: string,
    quantity: number,
    buyPrice: number
  ): Promise<void> {
    const existingWallet = await prisma.userWallet.findUnique({
      where: { userId_cryptoSymbol: { userId, cryptoSymbol } },
    });

    if (existingWallet) {
      const totalInvested = existingWallet.totalInvested + quantity * buyPrice;
      const newQuantity = existingWallet.quantity + quantity;
      const newAverageBuyPrice = totalInvested / newQuantity;

      await prisma.userWallet.update({
        where: { userId_cryptoSymbol: { userId, cryptoSymbol } },
        data: { quantity: newQuantity, averageBuyPrice: newAverageBuyPrice, totalInvested },
      });
    } else {
      await prisma.userWallet.create({
        data: { userId, cryptoSymbol, quantity, averageBuyPrice: buyPrice, totalInvested: quantity * buyPrice },
      });
    }
  }

  // Get trade history
  async getTradeHistory(userId: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    return prisma.trade.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: limit, skip: offset });
  }

  // Get user wallets
  async getUserWallets(userId: string): Promise<any[]> {
    return prisma.userWallet.findMany({ where: { userId } });
  }

  // Get trade stats
  async getTradeStats(userId: string): Promise<any> {
    const trades = await prisma.trade.findMany({ where: { userId, status: TradeStatus.EXECUTED } });

    const totalTrades = trades.length;
    const winTrades = trades.filter(t => t.outcome === TradeOutcome.WIN).length;
    const lossTrades = trades.filter(t => t.outcome === TradeOutcome.LOSS).length;
    const totalProfit = trades.reduce((sum, t) => sum + (t.profitLoss ?? 0), 0);

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

  // Execute trade (with optional forced outcome)
  async executeTrade(tradeId: string, forcedOutcome?: TradeOutcome): Promise<ExecuteTradeResult> {
    const trade = await prisma.trade.findUnique({ where: { id: tradeId } });
    if (!trade) throw new ValidationError('Trade not found');
    if (trade.status !== TradeStatus.SCHEDULED) throw new ValidationError('Trade is not scheduled');
    if (trade.entryPrice == null) throw new ValidationError('Trade entry price is missing');
    if (trade.quantity == null) throw new ValidationError('Trade quantity is missing');

    const priceData = await cryptoPriceService.getCryptoPrice(trade.cryptoSymbol);
    const exitPrice = priceData.price;

    // Use forced outcome if provided
    const outcome = forcedOutcome ?? (await this.determineTradeOutcome());

    const { profitLoss, profitLossPercent } = this.calculateProfitLoss(
      trade.entryPrice,
      exitPrice,
      trade.amountUSD,
      outcome
    );

    await prisma.$transaction(async (tx) => {
      // Update trade
      await tx.trade.update({
        where: { id: trade.id },
        data: { status: TradeStatus.EXECUTED, outcome, exitPrice, profitLoss, profitLossPercent },
      });

      // Update demo balance safely
      await tx.user.update({
        where: { id: trade.userId },
        data: { demoBalance: { increment: profitLoss ?? 0 } },
      });

      // Update wallet if WIN
      if (outcome === TradeOutcome.WIN) {
        await this.updateUserWallet(trade.userId, trade.cryptoSymbol, trade.quantity!, trade.entryPrice!);
      }
    });

    return {
      tradeId: trade.id,
      status: TradeStatus.EXECUTED,
      outcome,
      profitLoss,
      profitLossPercent,
      entryPrice: trade.entryPrice!,
      exitPrice,
      quantity: trade.quantity!,
    };
  }
}

export const tradingService = new TradingService();
export type { ScheduleTradeInput, ExecuteTradeResult };
