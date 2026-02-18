import bcrypt from 'bcrypt';
import { prisma } from '../prismaClient';
import { tradeStore } from '../stores/tradeStore';

class AdminService {
  // Helper function to get asset as string
  private getAssetString(asset: string | { symbol: string }): string {
    return typeof asset === 'string' ? asset : asset.symbol;
  }

  // --- Contacts ---
  async getContacts() {
    const contacts = await prisma.adminContact.findMany();
    return contacts;
  }

  async addOrUpdateContact(platform: string, value: string) {
    if (!platform || !value) throw new Error('Platform and value are required');

    const contact = await prisma.adminContact.upsert({
      where: { platform },
      update: { value },
      create: { platform, value },
    });

    return contact;
  }

  async deleteContact(id: string) {
    const contact = await prisma.adminContact.delete({ where: { id } });
    return contact;
  }

  // --- Reset Admin Password ---
  async resetAdminPassword(superAdminId: string, adminId: string, newPassword: string): Promise<void> {
    // Verify SUPER_ADMIN
    const superAdmin = await prisma.user.findUnique({ where: { id: superAdminId } });
    if (!superAdmin || superAdmin.role !== 'SUPER_ADMIN') {
      throw new Error('Only SUPER_ADMIN can reset admin passwords');
    }

    // Find Admin
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin) throw new Error('Admin not found');
    if (admin.role !== 'ADMIN') throw new Error('Can only reset passwords for ADMIN users');

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and force reset
    await prisma.user.update({
      where: { id: adminId },
      data: {
        password: hashedPassword,
        forcePasswordReset: true, // ensure field exists in schema
        passwordUpdatedAt: new Date(),
      },
    });
  }

  // --- Platform statistics ---
  async getStats() {
    return tradeStore.getStats();
  }

  async getUsers(limit: number = 50, offset: number = 0) {
    const allUsers = Array.from(
      tradeStore.getAllTrades().reduce((map, trade) => {
        map.set(trade.userId, { userId: trade.userId });
        return map;
      }, new Map<string, any>()).values(),
    );

    return {
      total: allUsers.length,
      users: allUsers.slice(offset, offset + limit),
    };
  }

  async getUserDetails(userId: string) {
    const trades = tradeStore.getUserTrades(userId);
    if (!trades || trades.length === 0) return null;

    const totalAmount = trades.reduce((sum, t) => sum + t.amount, 0);
    const totalReturned = trades.reduce((sum, t) => sum + t.returnedAmount, 0);

    return { userId, totalTrades: trades.length, totalAmount, totalReturned, trades };
  }

  async getTransactions(limit: number = 50, offset: number = 0) {
    const allTrades = tradeStore.getAllTrades();
    return { total: allTrades.length, transactions: allTrades.slice(offset, offset + limit) };
  }

  async getPortfolios(limit: number = 50, offset: number = 0) {
    const userMap = new Map<string, { userId: string; totalAmount: number }>();
    tradeStore.getAllTrades().forEach(t => {
      const entry = userMap.get(t.userId) || { userId: t.userId, totalAmount: 0 };
      entry.totalAmount += t.amount;
      userMap.set(t.userId, entry);
    });

    const portfolios = Array.from(userMap.values());
    return { total: portfolios.length, portfolios: portfolios.slice(offset, offset + limit) };
  }

  async getMostTradedCoins() {
    const coinMap = new Map<string, number>();
    tradeStore.getAllTrades().forEach(t => {
      const assetString = this.getAssetString(t.asset);
      coinMap.set(assetString, (coinMap.get(assetString) || 0) + 1);
    });

    return Array.from(coinMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([asset, count]) => ({ asset, count }));
  }

  async getTopPortfolios(limit: number = 10) {
    const userMap = new Map<string, number>();
    tradeStore.getAllTrades().forEach(t => {
      userMap.set(t.userId, (userMap.get(t.userId) || 0) + t.returnedAmount);
    });

    return Array.from(userMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([userId, totalReturned]) => ({ userId, totalReturned }));
  }

  async getMarketMetrics() {
    const trades = tradeStore.getAllTrades();
    return { totalVolume: trades.reduce((sum, t) => sum + t.amount, 0), totalTrades: trades.length };
  }

  async getAuditLogs(limit: number = 50, offset: number = 0) {
    const allTrades = tradeStore.getAllTrades();
    return { total: allTrades.length, logs: allTrades.slice(offset, offset + limit) };
  }

  async deleteUserById(userId: string) {
    const trades = tradeStore.getUserTrades(userId);

    if (!trades || trades.length === 0) {
      throw new Error('User not found');
    }

    tradeStore.deleteUserTrades(userId);
    tradeStore.removeUserOverride(userId);

    return { userId, deletedTrades: trades.length, deletedAt: new Date() };
  }
}

export const adminService = new AdminService();