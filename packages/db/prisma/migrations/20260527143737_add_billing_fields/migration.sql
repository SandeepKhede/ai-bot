-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "planRenewsAt" TIMESTAMP(3),
ADD COLUMN     "razorpayCustomerId" TEXT,
ADD COLUMN     "razorpaySubscriptionId" TEXT,
ADD COLUMN     "subscriptionStatus" TEXT;
