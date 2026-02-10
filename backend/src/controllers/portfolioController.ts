import { Response } from 'express';
import { portfolioService } from '../services/portfolioService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { addAssetSchema, updateAssetSchema } from '../validations/portfolioValidation';
import { createSuccessResponse } from '../utils/errors';

export class PortfolioController {
  async getPortfolio(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
      return;
    }

    const portfolio = await portfolioService.getPortfolio(userId);
    res.status(200).json(
      createSuccessResponse(portfolio, 'Portfolio retrieved successfully'),
    );
  }

  async getPortfolioStats(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
      return;
    }

    const stats = await portfolioService.getPortfolioStats(userId);
    res.status(200).json(
      createSuccessResponse(stats, 'Portfolio stats retrieved successfully'),
    );
  }

  async addAsset(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
      return;
    }

    const validatedData = addAssetSchema.parse(req.body);
    const asset = await portfolioService.addAsset(userId, validatedData);

    res.status(201).json(
      createSuccessResponse(asset, 'Asset added successfully'),
    );
  }

  async updateAsset(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { assetId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
      return;
    }

    const validatedData = updateAssetSchema.parse(req.body);
    const asset = await portfolioService.updateAsset(userId, assetId, validatedData);

    res.status(200).json(
      createSuccessResponse(asset, 'Asset updated successfully'),
    );
  }

  async removeAsset(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { assetId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
      return;
    }

    const result = await portfolioService.removeAsset(userId, assetId);
    res.status(200).json(
      createSuccessResponse(result, 'Asset removed successfully'),
    );
  }

  async updatePrices(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
        errorCode: 'UNAUTHORIZED',
      });
      return;
    }

    const portfolio = await portfolioService.getPortfolio(userId);
    await portfolioService.updateAssetPrices(portfolio.id);

    const updatedPortfolio = await portfolioService.getPortfolio(userId);
    res.status(200).json(
      createSuccessResponse(updatedPortfolio, 'Prices updated successfully'),
    );
  }
}

export const portfolioController = new PortfolioController();
