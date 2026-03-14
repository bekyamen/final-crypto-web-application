import bcrypt from 'bcrypt';
import { prisma } from '../prismaClient';

class AdminService {
  // Helper: calculate returnedAmount for a trade
  private getReturnedAmount(trade: {
    amountUSD: number;
    profitLoss?: number | null;
  }): number {
    return trade.amountUSD + (trade.profitLoss ?? 0);
  }

  // Helper: get asset as string
  private getAssetString(asset: string | { symbol: string }): string {
    return typeof asset === 'string' ? asset : asset.symbol;
  }

  /** ==================== CONTACTS ==================== */
  async getContacts() {
    return prisma.adminContact.findMany();
  }

  async addOrUpdateContact(platform: string, value: string) {
    if (!platform || !value) throw new Error('Platform and value are required');
    return prisma.adminContact.upsert({
      where: { platform },
      update: { value },
      create: { platform, value },
    });
  }

  async deleteContact(id: string) {
    return prisma.adminContact.delete({ where: { id } });
  }

  /** ==================== ADMIN PASSWORD RESET ==================== */
  async resetAdminPassword(superAdminId: string, adminId: string, newPassword: string): Promise<void> {
    const superAdmin = await prisma.user.findUnique({ where: { id: superAdminId } });
    if (!superAdmin || superAdmin.role !== 'SUPER_ADMIN') throw new Error('Only SUPER_ADMIN can reset admin passwords');

    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin) throw new Error('Admin not found');
    if (admin.role !== 'ADMIN') throw new Error('Can only reset passwords for ADMIN users');

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: adminId },
      data: {
        password: hashedPassword,
        forcePasswordReset: true,
        passwordUpdatedAt: new Date(),
      },
    });
  }

  /** ==================== TRADES / USERS ==================== */
  async getStats() {
    const totalTrades = await prisma.trade.count();
    const totalUsers = await prisma.user.count();
    const totalVolume = await prisma.trade.aggregate({
      _sum: { amountUSD: true },
    });

    return {
      totalTrades,
      totalUsers,
      totalVolume: totalVolume._sum.amountUSD || 0,
    };
  }

  async getUsers(limit: number = 50, offset: number = 0) {
    const users = await prisma.user.findMany({
      take: limit,
      skip: offset,
      orderBy: { email: 'asc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        balance: true,
        demoBalance: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const total = await prisma.user.count();

    return { total, users };
  }

  async getUserDetails(userId: string) {
    const trades = await prisma.trade.findMany({ where: { userId } });
    if (!trades || trades.length === 0) return null;

    const totalAmount = trades.reduce((sum, t) => sum + t.amountUSD, 0);
    const totalReturned = trades.reduce((sum, t) => sum + this.getReturnedAmount(t), 0);

    return { userId, totalTrades: trades.length, totalAmount, totalReturned, trades };
  }

  async getTransactions(limit: number = 50, offset: number = 0) {
    const trades = await prisma.trade.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.trade.count();

    return { total, transactions: trades.map(t => ({ ...t, returnedAmount: this.getReturnedAmount(t) })) };
  }

  async getPortfolios(limit: number = 50, offset: number = 0) {
    const trades = await prisma.trade.findMany();

    const userMap = new Map<string, { userId: string; totalAmount: number }>();
    trades.forEach(t => {
      const entry = userMap.get(t.userId) || { userId: t.userId, totalAmount: 0 };
      entry.totalAmount += t.amountUSD;
      userMap.set(t.userId, entry);
    });

    const portfolios = Array.from(userMap.values());
    return { total: portfolios.length, portfolios: portfolios.slice(offset, offset + limit) };
  }

  async getMostTradedCoins() {
    const trades = await prisma.trade.findMany();
    const coinMap = new Map<string, number>();

    trades.forEach(t => {
      const symbol = this.getAssetString(t.cryptoSymbol);
      coinMap.set(symbol, (coinMap.get(symbol) || 0) + 1);
    });

    return Array.from(coinMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([asset, count]) => ({ asset, count }));
  }

  async getTopPortfolios(limit: number = 10) {
    const trades = await prisma.trade.findMany();

    const userMap = new Map<string, number>();
    trades.forEach(t => {
      userMap.set(t.userId, (userMap.get(t.userId) || 0) + this.getReturnedAmount(t));
    });

    return Array.from(userMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([userId, totalReturned]) => ({ userId, totalReturned }));
  }

  async getMarketMetrics() {
    const trades = await prisma.trade.findMany();
    const totalVolume = trades.reduce((sum, t) => sum + t.amountUSD, 0);

    return { totalTrades: trades.length, totalVolume };
  }

  async getAuditLogs(limit: number = 50, offset: number = 0) {
    const trades = await prisma.trade.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    return { total: await prisma.trade.count(), logs: trades.map(t => ({ ...t, returnedAmount: this.getReturnedAmount(t) })) };
  }

  async deleteUserById(userId: string) {
    const trades = await prisma.trade.findMany({ where: { userId } });
    if (!trades || trades.length === 0) throw new Error('User not found');

    await prisma.trade.deleteMany({ where: { userId } });
    await prisma.userOverride.deleteMany({ where: { userId } });

    return { userId, deletedTrades: trades.length, deletedAt: new Date() };
  }
}

export const adminService = new AdminService();