/*
  Warnings:

  - The `forceOutcome` column on the `UserOverride` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId,tradeType]` on the table `UserOverride` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "OverrideTradeType" AS ENUM ('REAL', 'DEMO');

-- DropForeignKey
ALTER TABLE "UserOverride" DROP CONSTRAINT "UserOverride_userId_fkey";

-- DropIndex
DROP INDEX "UserOverride_userId_key";

-- AlterTable
ALTER TABLE "UserOverride" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tradeType" "OverrideTradeType" NOT NULL DEFAULT 'REAL',
DROP COLUMN "forceOutcome",
ADD COLUMN     "forceOutcome" "TradeOutcome";

-- CreateIndex
CREATE INDEX "UserOverride_userId_idx" ON "UserOverride"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserOverride_userId_tradeType_key" ON "UserOverride"("userId", "tradeType");

-- AddForeignKey
ALTER TABLE "UserOverride" ADD CONSTRAINT "UserOverride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
