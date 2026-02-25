/*
  Warnings:

  - A unique constraint covering the columns `[coin,network]` on the table `DepositWallet` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "DepositWallet_coin_key";

-- AlterTable
ALTER TABLE "DepositWallet" ADD COLUMN     "network" "NetworkType";

-- CreateIndex
CREATE UNIQUE INDEX "DepositWallet_coin_network_key" ON "DepositWallet"("coin", "network");
