import { PrismaClient, TradeOutcome } from '@prisma/client';
import bcrypt from 'bcrypt';
import { tradingService } from './tradingService';
import { NotFoundError } from '../utils/errors';
const prisma = new PrismaClient();


interface AdjustBalanceInput {
  userId: string;
  amount: number;
  reason: string;
  adminId: string;
}

interface UpdateSettingsInput {
  winPercentage?: number;
  lossPercentage?: number;
  neutralPercentage?: number;
  useRandomOutcome?: boolean;
  priceVariation?: number;
  tradingEnabled?: boolean;
  minTradeAmount?: number;
  maxTradeAmount?: number;
  adminOverride?: boolean;
}

class TradeAdminService {
  async adjustUserBalance(input: AdjustBalanceInput): Promise<any> {
    const { userId, amount, reason, adminId } = input;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User');
    }

    const newBalance = user.balance + amount;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { balance: newBalance },
    });

    // Log audit
    await this.logAuditAction({
      adminId,
      action: 'BALANCE_ADJUSTED',
      targetUserId: userId,
      changes: {
        before: user.balance,
        after: newBalance,
        amount,
      },
      reason,
    });

    return {
      userId: updatedUser.id,
      previousBalance: user.balance,
      newBalance: updatedUser.balance,
      adjustment: amount,
      reason,
    };
  }

  async resetUserPassword(userId: string, newPassword: string, adminId: string): Promise<any> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await this.logAuditAction({
      adminId,
      action: 'PASSWORD_RESET',
      targetUserId: userId,
      reason: 'Admin password reset',
    });

    return { userId, message: 'Password reset successfully' };
  }

  async getTradingSettings(): Promise<any> {
    let settings = await prisma.tradingSettings.findFirst();

    if (!settings) {
      settings = await prisma.tradingSettings.create({
        data: {
          winPercentage: 60,
          lossPercentage: 30,
          neutralPercentage: 10,
          useRandomOutcome: true,
          priceVariation: 2,
          tradingEnabled: true,
          minTradeAmount: 10,
          maxTradeAmount: 100000,
          adminOverride: false,
        },
      });
    }

    return settings;
  }

  async updateTradingSettings(input: UpdateSettingsInput, adminId: string): Promise<any> {
    const currentSettings = await this.getTradingSettings();

    // Validate percentages if provided
    if (input.winPercentage || input.lossPercentage || input.neutralPercentage) {
      const win = input.winPercentage ?? currentSettings.winPercentage;
      const loss = input.lossPercentage ?? currentSettings.lossPercentage;
      const neutral = input.neutralPercentage ?? currentSettings.neutralPercentage;

      if (Math.abs(win + loss + neutral - 100) > 0.1) {
        throw new Error('Win + Loss + Neutral percentages must equal 100');
      }
    }

    const updatedSettings = await prisma.tradingSettings.update({
      where: { id: currentSettings.id },
      data: {
        winPercentage: input.winPercentage ?? currentSettings.winPercentage,
        lossPercentage: input.lossPercentage ?? currentSettings.lossPercentage,
        neutralPercentage: input.neutralPercentage ?? currentSettings.neutralPercentage,
        useRandomOutcome: input.useRandomOutcome ?? currentSettings.useRandomOutcome,
        priceVariation: input.priceVariation ?? currentSettings.priceVariation,
        tradingEnabled: input.tradingEnabled ?? currentSettings.tradingEnabled,
        minTradeAmount: input.minTradeAmount ?? currentSettings.minTradeAmount,
        maxTradeAmount: input.maxTradeAmount ?? currentSettings.maxTradeAmount,
        adminOverride: input.adminOverride ?? currentSettings.adminOverride,
      },
    });

    await this.logAuditAction({
      adminId,
      action: 'SETTINGS_UPDATED',
      entityType: 'TradingSettings',
      entityId: updatedSettings.id,
      changes: {
        before: currentSettings,
        after: updatedSettings,
      },
    });

    return updatedSettings;
  }

  async forceExecuteTrade(tradeId: string, outcome: TradeOutcome, adminId: string): Promise<any> {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
    });

    if (!trade) {
      throw new NotFoundError('Trade');
    }

    const result = await tradingService.executeTrade(tradeId, outcome);

    // Mark trade as forced
    await prisma.trade.update({
      where: { id: tradeId },
      data: {
        isForced: true,
        forcedOutcome: outcome,
      },
    });

    await this.logAuditAction({
      adminId,
      action: 'TRADE_FORCED',
      targetUserId: trade.userId,
      entityType: 'Trade',
      entityId: tradeId,
      changes: {
        forcedOutcome: outcome,
      },
      reason: 'Admin force executed trade',
    });

    return result;
  }

  async cancelTrade(tradeId: string, adminId: string, reason: string): Promise<any> {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
    });

    if (!trade) {
      throw new NotFoundError('Trade');
    }

    const cancelledTrade = await prisma.trade.update({
      where: { id: tradeId },
      data: { status: 'CANCELLED' },
    });

    await this.logAuditAction({
      adminId,
      action: 'TRADE_CANCELLED',
      targetUserId: trade.userId,
      entityType: 'Trade',
      entityId: tradeId,
      reason,
    });

    return cancelledTrade;
  }

  async getPlatformStats(): Promise<any> {
    const totalUsers = await prisma.user.count();
    const totalTrades = await prisma.trade.count();
    const totalExecutedTrades = await prisma.trade.count({
      where: { status: 'EXECUTED' },
    });

    const executedTrades = await prisma.trade.findMany({
      where: { status: 'EXECUTED' },
    });

    const totalProfit = executedTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0);

    return {
      totalUsers,
      totalTrades,
      totalExecutedTrades,
      totalProfit,
      averageTradeProfit: totalExecutedTrades > 0 ? totalProfit / totalExecutedTrades : 0,
    };
  }

  async getUserStats(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        trades: { where: { status: 'EXECUTED' } },
        userWallets: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const tradeStats = await tradingService.getTradeStats(userId);

    return {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      balance: user.balance,
      totalInvested: user.totalInvested,
      totalEarnings: user.totalEarnings,
      wallets: user.userWallets,
      tradeStats,
      createdAt: user.createdAt,
    };
  }

  async getAllUsers(limit: number = 50, offset: number = 0): Promise<any> {
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        balance: true,
        totalEarnings: true,
        createdAt: true,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.user.count({
      where: { role: 'USER' },
    });

    return { users, total, limit, offset };
  }

  // src/services/tradeAdminService.ts

async deleteUser(userId: string, adminId: string): Promise<any> {
  // 1. Find the user
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError('User');
  }

  // 2. Delete all trades for the user
  const deletedTrades = await prisma.trade.deleteMany({ where: { userId } });

  // 3. Optionally delete wallets or other related data
  await prisma.userWallet.deleteMany({ where: { userId } });

  // 4. Delete the user itself
  await prisma.user.delete({ where: { id: userId } });

  // 5. Log admin audit
  await this.logAuditAction({
    adminId,
    action: 'USER_DELETED',
    targetUserId: userId,
    changes: {
      deletedTrades: deletedTrades.count,
      deletedWallets: undefined, // or count if needed
    },
    reason: 'Admin deleted user',
  });

  return {
    userId,
    deletedTrades: deletedTrades.count,
    message: 'User deleted successfully',
  };
}

async getUserById(userId: string): Promise<any> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userWallets: true, // include wallets if needed
      trades: true,      // include trades if needed
    },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    balance: user.balance,
    totalEarnings: user.totalEarnings,
    createdAt: user.createdAt,
    wallets: user.userWallets,
    trades: user.trades,
  };
}




  async getAllTrades(limit: number = 50, offset: number = 0): Promise<any> {
    const trades = await prisma.trade.findMany({
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.trade.count();

    return { trades, total, limit, offset };
  }

  async getAuditLogs(adminId?: string, limit: number = 100, offset: number = 0): Promise<any> {
    const logs = await prisma.auditLog.findMany({
      where: adminId ? { adminId } : {},
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    return logs;
  }

  private async logAuditAction(data: {
    adminId: string;
    action: string;
    targetUserId?: string;
    entityType?: string;
    entityId?: string;
    changes?: any;
    reason?: string;
  }): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          adminId: data.adminId,
          action: data.action,
          targetUserId: data.targetUserId,
          entityType: data.entityType,
          entityId: data.entityId,
          changes: data.changes,
          reason: data.reason,
        },
      });
    } catch (error) {
      console.error('Error logging audit action:', error);
    }
  }
}

export const tradeAdminService = new TradeAdminService();
export type { AdjustBalanceInput, UpdateSettingsInput };
