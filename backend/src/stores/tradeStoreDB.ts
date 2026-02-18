// // src/stores/tradeStoreDB.ts
// import { PrismaClient, TradeOutcome as PrismaTradeOutcome, TradeType as PrismaTradeType } from '@prisma/client';
// import { Trade, AdminSettings, UserOverride, ExpirationTime } from '../types/trade.types';

// const prisma = new PrismaClient();

// export class TradeStoreDB {
//   /* =========================
//      TRADE OPERATIONS
//   ========================== */

//   async addTrade(trade: Trade) {
//     await prisma.trade.create({
//       data: {
//         id: trade.id,
//         userId: trade.userId,
//         type: trade.type.toUpperCase() as PrismaTradeType,
//         cryptoSymbol: trade.asset,
//         amountUSD: trade.amount,
//         scheduledTime: trade.timestamp,
//         executedAt: trade.completedAt,
//         status: 'EXECUTED',
//         outcome: trade.outcome === 'WIN' ? PrismaTradeOutcome.WIN : PrismaTradeOutcome.LOSS,
//         profitLoss: trade.profitLossAmount,
//         profitLossPercent: trade.profitLossPercent,
//       },
//     });
//   }

//   async getAllTrades(): Promise<Trade[]> {
//     const trades = await prisma.trade.findMany({ orderBy: { createdAt: 'desc' } });
//     return trades.map(t => this.mapDbTradeToTrade(t));
//   }

//   async getUserTrades(userId: string): Promise<Trade[]> {
//     const trades = await prisma.trade.findMany({
//       where: { userId },
//       orderBy: { createdAt: 'desc' },
//     });
//     return trades.map(t => this.mapDbTradeToTrade(t));
//   }

//   async deleteUserTrades(userId: string): Promise<number> {
//     const result = await prisma.trade.deleteMany({ where: { userId } });
//     return result.count;
//   }

//   /* =========================
//      USER BALANCE
//   ========================== */

//   async updateUserBalance(userId: string, delta: number): Promise<number> {
//     const user = await prisma.user.update({
//       where: { id: userId },
//       data: {
//         balance: { increment: delta },
//       },
//     });
//     return user.balance;
//   }

//   async getUserBalance(userId: string): Promise<number> {
//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: { balance: true },
//     });
//     return user?.balance ?? 0;
//   }

//   /* =========================
//      ADMIN SETTINGS
//   ========================== */

//   async getAdminSettings(): Promise<AdminSettings> {
//     const settings = await prisma.tradingSettings.findFirst();
//     return {
//       globalMode: settings?.useRandomOutcome
//         ? 'random'
//         : settings?.adminOverride
//         ? 'win'
//         : 'lose',
//       winProbability: settings?.winPercentage ?? 60,
//       userOverrides: new Map(), // populated separately
//     };
//   }

//   /* =========================
//      USER OVERRIDES
//   ========================== */

//   async getUserOverride(userId: string): Promise<UserOverride | null> {
//     const override = await prisma.userOverride.findFirst({ where: { userId } });
//     if (!override) return null;
//     if (override.expiresAt && new Date() > override.expiresAt) return null;

//     return {
//       userId,
//       forceOutcome: override.forceOutcome === 'WIN' ? 'win' : 'lose',
//       expiresAt: override.expiresAt ?? undefined,
//     };
//   }

//   async setUserOverride(userId: string, forceOutcome: 'win' | 'lose' | null, expiresAt?: Date) {
//     if (!forceOutcome) {
//       await prisma.userOverride.deleteMany({ where: { userId } });
//     } else {
//       await prisma.userOverride.upsert({
//         where: { userId },
//         create: { userId, forceOutcome: forceOutcome.toUpperCase() as PrismaTradeOutcome, expiresAt },
//         update: { forceOutcome: forceOutcome.toUpperCase() as PrismaTradeOutcome, expiresAt },
//       });
//     }
//   }

//   /* =========================
//      STATS
//   ========================== */

//   async getStats() {
//     const trades = await prisma.trade.findMany();

//     const totalTrades = trades.length;
//     const totalWins = trades.filter(t => t.outcome === PrismaTradeOutcome.WIN).length;
//     const totalLosses = trades.filter(t => t.outcome === PrismaTradeOutcome.LOSS).length;
//     const totalVolumeUSD = trades.reduce((sum, t) => sum + t.amountUSD, 0);
//     const totalReturned = trades.reduce((sum, t) => sum + (t.profitLoss ?? 0), 0);

//     return {
//       totalTrades,
//       totalWins,
//       totalLosses,
//       winRate: totalTrades > 0 ? ((totalWins / totalTrades) * 100).toFixed(2) : '0',
//       totalVolumeUSD: totalVolumeUSD.toFixed(2),
//       totalReturned: totalReturned.toFixed(2),
//       totalProfit: (totalReturned - totalVolumeUSD).toFixed(2),
//     };
//   }

//   /* =========================
//      HELPERS
//   ========================== */

//   private mapDbTradeToTrade(t: any): Trade {
//     return {
//       id: t.id,
//       userId: t.userId,
//       type: t.type.toLowerCase() as 'buy' | 'sell',
//       asset: t.cryptoSymbol,
//       amount: t.amountUSD,
//       expirationTime: 30 as ExpirationTime, // default; could fetch real value if stored
//       outcome: t.outcome === PrismaTradeOutcome.WIN ? 'WIN' : 'LOSE',
//       returnedAmount: t.profitLoss,
//       profitLossAmount: t.profitLoss,
//       profitLossPercent: t.profitLossPercent,
//       timestamp: t.scheduledTime,
//       completedAt: t.executedAt,
//     };
//   }
// }

// export const tradeStore = new TradeStoreDB();
