/*
  Warnings:

  - Made the column `network` on table `DepositWallet` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "DepositWallet" ALTER COLUMN "network" SET NOT NULL;
