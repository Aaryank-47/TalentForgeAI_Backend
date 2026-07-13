/*
  Warnings:

  - A unique constraint covering the columns `[invitationToken]` on the table `CompanyMember` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CompanyMember" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "invitationToken" TEXT,
ADD COLUMN     "invitedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyMember_invitationToken_key" ON "CompanyMember"("invitationToken");
