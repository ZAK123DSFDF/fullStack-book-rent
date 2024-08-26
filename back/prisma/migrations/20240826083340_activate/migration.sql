-- CreateEnum
CREATE TYPE "updateStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updateStatus" "updateStatus" NOT NULL DEFAULT 'INACTIVE';
