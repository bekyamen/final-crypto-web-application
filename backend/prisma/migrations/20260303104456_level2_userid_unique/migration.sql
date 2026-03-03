/*
  Warnings:

  - You are about to drop the column `reviewNote` on the `Level2Verification` table. All the data in the column will be lost.
  - You are about to drop the column `reviewedBy` on the `Level2Verification` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Level2Verification` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Level2Verification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Level2Verification` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Level2Verification" DROP CONSTRAINT "Level2Verification_userId_fkey";

-- AlterTable
ALTER TABLE "Level2Verification" DROP COLUMN "reviewNote",
DROP COLUMN "reviewedBy",
DROP COLUMN "status",
DROP COLUMN "updatedAt";

-- CreateIndex
CREATE UNIQUE INDEX "Level2Verification_userId_key" ON "Level2Verification"("userId");

-- CreateIndex
CREATE INDEX "Level2Verification_createdAt_idx" ON "Level2Verification"("createdAt");

-- AddForeignKey
ALTER TABLE "Level2Verification" ADD CONSTRAINT "Level2Verification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
