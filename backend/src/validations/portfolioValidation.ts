import { z } from 'zod';

export const addAssetSchema = z.object({
  coinId: z.string().min(1, 'Coin ID is required'),
  quantity: z.number().positive('Quantity must be positive'),
  averageBuyPrice: z.number().positive('Average buy price must be positive'),
});

export const updateAssetSchema = z.object({
  quantity: z.number().positive('Quantity must be positive').optional(),
  averageBuyPrice: z.number().positive('Average buy price must be positive').optional(),
});

export const createTransactionSchema = z.object({
  coinId: z.string().min(1, 'Coin ID is required'),
  type: z.enum(['BUY', 'SELL', 'DEPOSIT', 'WITHDRAWAL']),
  quantity: z.number().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive'),
  fee: z.number().nonnegative('Fee cannot be negative').default(0),

  notes: z.string().optional(),
});

export const getPortfolioStatsSchema = z.object({
  timeframe: z.enum(['24h', '7d', '30d', '90d', '1y', 'all']).default('30d'),
});

export type AddAssetInput = z.infer<typeof addAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type GetPortfolioStatsInput = z.infer<typeof getPortfolioStatsSchema>;
