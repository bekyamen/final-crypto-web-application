/*
  Warnings:

  - A unique constraint covering the columns `[tradeType]` on the table `TradingSettings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TradingSettings" ADD COLUMN     "tradeType" TEXT NOT NULL DEFAULT 'DEMO';

-- CreateIndex
CREATE UNIQUE INDEX "TradingSettings_tradeType_key" ON "TradingSettings"("tradeType");
