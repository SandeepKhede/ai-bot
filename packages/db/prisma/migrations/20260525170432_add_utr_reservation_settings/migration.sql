-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "utrNumber" TEXT,
ADD COLUMN     "utrVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "utrAdvancePaise" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "utrEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "utrUpiId" TEXT;
