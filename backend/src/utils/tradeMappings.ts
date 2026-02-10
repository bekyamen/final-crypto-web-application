// src/utils/tradeMappings.ts
import { TradeType as PrismaTradeType, TradeOutcome as PrismaTradeOutcome } from '@prisma/client';
import { TradeType, TradeOutcome } from '../types/trade.types';

/**
 * Convert our TS trade type to Prisma enum
 */
export function toPrismaTradeType(type: TradeType): PrismaTradeType {
  switch (type) {
    case 'buy':
      return PrismaTradeType.BUY;
    case 'sell':
      return PrismaTradeType.SELL;
    default:
      throw new Error(`Invalid trade type: ${type}`);
  }
}

/**
 * Convert Prisma enum to our TS type
 */
export function fromPrismaTradeType(type: PrismaTradeType): TradeType {
  switch (type) {
    case PrismaTradeType.BUY:
      return 'buy';
    case PrismaTradeType.SELL:
      return 'sell';
    default:
      throw new Error(`Invalid Prisma trade type: ${type}`);
  }
}

/**
 * Convert our TS trade outcome to Prisma enum
 */
export function toPrismaTradeOutcome(outcome: TradeOutcome): PrismaTradeOutcome {
  switch (outcome) {
    case 'WIN':
      return PrismaTradeOutcome.WIN;
    case 'LOSE':
      return PrismaTradeOutcome.LOSS;
    default:
      throw new Error(`Invalid trade outcome: ${outcome}`);
  }
}

/**
 * Convert Prisma enum to our TS type
 */
export function fromPrismaTradeOutcome(outcome: PrismaTradeOutcome | null | undefined): TradeOutcome {
  switch (outcome) {
    case PrismaTradeOutcome.WIN:
      return 'WIN';
    case PrismaTradeOutcome.LOSS:
      return 'LOSE';
    case undefined:
    case null:
      return 'LOSE'; // default fallback
    default:
      throw new Error(`Invalid Prisma trade outcome: ${outcome}`);
  }
}
