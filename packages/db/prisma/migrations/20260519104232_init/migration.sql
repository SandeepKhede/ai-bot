-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('STARTER', 'GROWTH', 'PRO');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "waPhoneNumberId" TEXT NOT NULL,
    "waAccessToken" TEXT NOT NULL,
    "address" TEXT,
    "locationLink" TEXT,
    "businessHours" JSONB NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'STARTER',
    "botActive" BOOLEAN NOT NULL DEFAULT true,
    "humanHandoff" BOOLEAN NOT NULL DEFAULT false,
    "monthlyAiCalls" INTEGER NOT NULL DEFAULT 0,
    "aiCallsResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "name" TEXT,
    "label" TEXT,
    "visitCount" INTEGER NOT NULL DEFAULT 1,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pricePaise" INTEGER NOT NULL,
    "description" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "keywords" TEXT[],
    "priority" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "guests" INTEGER NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageLog" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_whatsappNumber_key" ON "Restaurant"("whatsappNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_waPhoneNumberId_key" ON "Restaurant"("waPhoneNumberId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_restaurantId_whatsappNumber_key" ON "Customer"("restaurantId", "whatsappNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Session_restaurantId_customerPhone_key" ON "Session"("restaurantId", "customerPhone");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faq" ADD CONSTRAINT "Faq_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
