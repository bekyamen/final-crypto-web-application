import * as cron from 'node-cron';

import { PrismaClient, TradeStatus } from '@prisma/client';
import { tradingService } from '../services/tradingService';
import { cryptoPriceService } from '../services/cryptoPriceService';

const prisma = new PrismaClient();

class TradeScheduler {
 private cronJobs: Map<string, cron.ScheduledTask> = new Map();


  startScheduler(): void {
    console.log('[TradeScheduler] Starting trade scheduler...');

    // Check for trades every minute
    const checkTrades = cron.schedule('* * * * *', async () => {
      await this.checkAndExecutePendingTrades();
    });

    this.cronJobs.set('checkTrades', checkTrades);

    // Refresh crypto prices every 5 minutes
    const refreshPrices = cron.schedule('*/5 * * * *', async () => {
      await this.refreshCryptoPrices();
    });

    this.cronJobs.set('refreshPrices', refreshPrices);

    console.log('[TradeScheduler] Trade scheduler started successfully');
  }

  private async checkAndExecutePendingTrades(): Promise<void> {
    try {
      const now = new Date();

      // Find all scheduled trades that should be executed now
      const pendingTrades = await prisma.trade.findMany({
        where: {
          status: TradeStatus.SCHEDULED,
          scheduledTime: {
            lte: now,
          },
        },
      });

      console.log(`[TradeScheduler] Found ${pendingTrades.length} trades to execute`);

      for (const trade of pendingTrades) {
        try {
          console.log(`[TradeScheduler] Executing trade ${trade.id} for user ${trade.userId}`);
          await tradingService.executeTrade(trade.id);
          console.log(`[TradeScheduler] Successfully executed trade ${trade.id}`);
        } catch (error) {
          console.error(`[TradeScheduler] Error executing trade ${trade.id}:`, error);
        }
      }
    } catch (error) {
      console.error('[TradeScheduler] Error checking pending trades:', error);
    }
  }

  private async refreshCryptoPrices(): Promise<void> {
    try {
      const symbols = ['BTC', 'ETH', 'ADA', 'SOL', 'DOT', 'DOGE', 'XRP', 'USDT', 'USDC', 'BNB'];

      console.log('[TradeScheduler] Refreshing crypto prices...');
      await cryptoPriceService.refreshAllPrices(symbols);
      console.log('[TradeScheduler] Crypto prices refreshed successfully');
    } catch (error) {
      console.error('[TradeScheduler] Error refreshing prices:', error);
    }
  }

  stopScheduler(): void {
    console.log('[TradeScheduler] Stopping trade scheduler...');

    for (const [name, job] of this.cronJobs) {
      job.stop();
      job.destroy();
      console.log(`[TradeScheduler] Stopped job: ${name}`);
    }

    this.cronJobs.clear();
    console.log('[TradeScheduler] Trade scheduler stopped');
  }

  getSchedulerStatus(): any {
    return {
      running: this.cronJobs.size > 0,
      jobs: Array.from(this.cronJobs.keys()),
    };
  }
}

export const tradeScheduler = new TradeScheduler();
