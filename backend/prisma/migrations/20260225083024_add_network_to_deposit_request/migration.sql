/*
  Warnings:

  - Added the required column `network` to the `DepositRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DepositRequest" ADD COLUMN     "network" "NetworkType" NOT NULL;
