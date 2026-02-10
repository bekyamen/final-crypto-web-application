import { PrismaClient } from '@prisma/client';
import { cryptoService } from './cryptoService';
import { NotFoundError } from '../utils/errors';
import { AddAssetInput, UpdateAssetInput } from '../validations/portfolioValidation';

const prisma = new PrismaClient();

export class PortfolioService {
  async getPortfolio(userId: string) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: {
        assets: true,
      },
    });

    if (!portfolio) {
      throw new NotFoundError('Portfolio');
    }

    return portfolio;
  }

  async addAsset(userId: string, input: AddAssetInput) {
    const { coinId, quantity, averageBuyPrice } = input;

    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundError('Portfolio');
    }

    // Get current coin data
    const coinData = await cryptoService.getCachedOrFetchCoin(coinId);

    const totalBuyValue = quantity * averageBuyPrice;
    const totalCurrentValue = quantity * (coinData.currentPrice || averageBuyPrice);
    const pnl = totalCurrentValue - totalBuyValue;
    const pnlPercentage = (pnl / totalBuyValue) * 100;

    // Check if asset already exists
    const existingAsset = await prisma.portfolioAsset.findUnique({
      where: {
        portfolioId_coinId: {
          portfolioId: portfolio.id,
          coinId,
        },
      },
    });

    let asset;

    if (existingAsset) {
      // Update existing asset (average the price)
      const totalQuantity = existingAsset.quantity + quantity;
      const newAverageBuyPrice =
        (existingAsset.totalBuyValue + totalBuyValue) / totalQuantity;

      asset = await prisma.portfolioAsset.update({
        where: { id: existingAsset.id },
        data: {
          quantity: totalQuantity,
          averageBuyPrice: newAverageBuyPrice,
          totalBuyValue: totalBuyValue + existingAsset.totalBuyValue,
          currentPrice: coinData.currentPrice,
          totalCurrentValue: totalQuantity * (coinData.currentPrice || averageBuyPrice),
          pnl: totalQuantity * (coinData.currentPrice || averageBuyPrice) -
            (totalBuyValue + existingAsset.totalBuyValue),
        },
      });
    } else {
      // Create new asset
      asset = await prisma.portfolioAsset.create({
        data: {
          portfolioId: portfolio.id,
          coinId,
          coinName: coinData.name,
          coinSymbol: coinData.symbol,
          quantity,
          averageBuyPrice,
          currentPrice: coinData.currentPrice,
          totalBuyValue,
          totalCurrentValue,
          pnl,
          pnlPercentage,
        },
      });
    }

    // Update portfolio totals
    await this.updatePortfolioTotals(portfolio.id);

    return asset;
  }

  async updateAsset(userId: string, assetId: string, input: UpdateAssetInput) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundError('Portfolio');
    }

    const asset = await prisma.portfolioAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset || asset.portfolioId !== portfolio.id) {
      throw new NotFoundError('Asset');
    }

    const updatedData: any = {};

    if (input.quantity !== undefined) {
      updatedData.quantity = input.quantity;
    }

    if (input.averageBuyPrice !== undefined) {
      updatedData.averageBuyPrice = input.averageBuyPrice;
    }

    if (updatedData.quantity || updatedData.averageBuyPrice) {
      const quantity = updatedData.quantity || asset.quantity;
      const averageBuyPrice = updatedData.averageBuyPrice || asset.averageBuyPrice;

      updatedData.totalBuyValue = quantity * averageBuyPrice;
      updatedData.totalCurrentValue = quantity * asset.currentPrice;
      updatedData.pnl = updatedData.totalCurrentValue - updatedData.totalBuyValue;
      updatedData.pnlPercentage = (updatedData.pnl / updatedData.totalBuyValue) * 100;
    }

    const updatedAsset = await prisma.portfolioAsset.update({
      where: { id: assetId },
      data: updatedData,
    });

    // Update portfolio totals
    await this.updatePortfolioTotals(portfolio.id);

    return updatedAsset;
  }

  async removeAsset(userId: string, assetId: string) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      throw new NotFoundError('Portfolio');
    }

    const asset = await prisma.portfolioAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset || asset.portfolioId !== portfolio.id) {
      throw new NotFoundError('Asset');
    }

    await prisma.portfolioAsset.delete({
      where: { id: assetId },
    });

    // Update portfolio totals
    await this.updatePortfolioTotals(portfolio.id);

    return { message: 'Asset removed successfully' };
  }

  async updatePortfolioTotals(portfolioId: string) {
    const assets = await prisma.portfolioAsset.findMany({
      where: { portfolioId },
    });

    const totalCurrentValue = assets.reduce((sum, asset) => sum + asset.totalCurrentValue, 0);
    const totalInvested = assets.reduce((sum, asset) => sum + asset.totalBuyValue, 0);
    const totalPnL = totalCurrentValue - totalInvested;
    const pnlPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

    await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        totalValue: totalCurrentValue,
        totalInvested,
        totalPnL,
        pnlPercentage,
      },
    });
  }

  async updateAssetPrices(portfolioId: string) {
    const assets = await prisma.portfolioAsset.findMany({
      where: { portfolioId },
    });

    for (const asset of assets) {
      try {
        const coinData = await cryptoService.getCachedOrFetchCoin(asset.coinId);

        const totalCurrentValue = asset.quantity * coinData.currentPrice;
        const pnl = totalCurrentValue - asset.totalBuyValue;
        const pnlPercentage = (pnl / asset.totalBuyValue) * 100;

        await prisma.portfolioAsset.update({
          where: { id: asset.id },
          data: {
            currentPrice: coinData.currentPrice,
            totalCurrentValue,
            pnl,
            pnlPercentage,
          },
        });
      } catch (error) {
        console.error(`[PortfolioService] Error updating price for ${asset.coinId}:`, error);
      }
    }

    await this.updatePortfolioTotals(portfolioId);
  }

  async getPortfolioStats(userId: string) {
    const portfolio = await this.getPortfolio(userId);
    const assets = await prisma.portfolioAsset.findMany({
      where: { portfolioId: portfolio.id },
      orderBy: { totalCurrentValue: 'desc' },
    });

    const totalAssets = assets.length;
    const topAsset = assets[0] || null;

    const assetAllocation = assets.map((asset) => ({
      coinSymbol: asset.coinSymbol,
      percentage: portfolio.totalValue > 0
        ? (asset.totalCurrentValue / portfolio.totalValue) * 100
        : 0,
    }));

    return {
      portfolio,
      assets,
      totalAssets,
      topAsset,
      assetAllocation,
    };
  }
}

export const portfolioService = new PortfolioService();
