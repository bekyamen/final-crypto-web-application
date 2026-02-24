/*
  Warnings:

  - Added the required column `usdValue` to the `WithdrawRequest` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `coin` on the `WithdrawRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `network` on the `WithdrawRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CoinType" AS ENUM ('BTC', 'ETH', 'USDT');

-- CreateEnum
CREATE TYPE "NetworkType" AS ENUM ('BTC', 'ERC20', 'TRC20');

-- AlterTable
ALTER TABLE "WithdrawRequest" ADD COLUMN     "usdValue" DOUBLE PRECISION NOT NULL,
DROP COLUMN "coin",
ADD COLUMN     "coin" "CoinType" NOT NULL,
DROP COLUMN "network",
ADD COLUMN     "network" "NetworkType" NOT NULL,
ALTER COLUMN "fee" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "WithdrawRequest_userId_idx" ON "WithdrawRequest"("userId");

-- CreateIndex
CREATE INDEX "WithdrawRequest_status_idx" ON "WithdrawRequest"("status");
