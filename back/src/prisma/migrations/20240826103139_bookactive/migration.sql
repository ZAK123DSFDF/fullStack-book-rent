/*
  Warnings:

  - The values [VERIFIED,NOTVERIFIED] on the enum `bookStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "bookStatus_new" AS ENUM ('ACTIVE', 'INACTIVE');
ALTER TABLE "Book" ALTER COLUMN "bookStatus" DROP DEFAULT;
ALTER TABLE "Book" ALTER COLUMN "bookStatus" TYPE "bookStatus_new" USING ("bookStatus"::text::"bookStatus_new");
ALTER TYPE "bookStatus" RENAME TO "bookStatus_old";
ALTER TYPE "bookStatus_new" RENAME TO "bookStatus";
DROP TYPE "bookStatus_old";
ALTER TABLE "Book" ALTER COLUMN "bookStatus" SET DEFAULT 'INACTIVE';
COMMIT;

-- AlterTable
ALTER TABLE "Book" ALTER COLUMN "bookStatus" SET DEFAULT 'INACTIVE';
