-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN "adminEmail" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN "adminPassword" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN "setupComplete" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_adminEmail_key" ON "Restaurant"("adminEmail");
