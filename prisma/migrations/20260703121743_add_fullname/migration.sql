/*
  Warnings:

  - You are about to drop the column `firstName` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Candidate` table. All the data in the column will be lost.
  - Added the required column `fullName` to the `Candidate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "fullName" TEXT NOT NULL;
