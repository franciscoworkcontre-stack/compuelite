-- Add promotion and invoice fields to Order
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "promotionDiscount" DECIMAL(10,2);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "invoicePdfUrl" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "invoiceNumber" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "invoiceIssuedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "reviewRequestScheduledAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "reviewRequestSentAt" TIMESTAMP(3);

-- Unique constraint on invoiceNumber (only if not exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Order_invoiceNumber_key'
  ) THEN
    ALTER TABLE "Order" ADD CONSTRAINT "Order_invoiceNumber_key" UNIQUE ("invoiceNumber");
  END IF;
END $$;

-- PromotionType enum
DO $$ BEGIN
  CREATE TYPE "PromotionType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BOGO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- PromotionConditionType enum
DO $$ BEGIN
  CREATE TYPE "PromotionConditionType" AS ENUM ('CART_TOTAL', 'CATEGORY', 'BRAND', 'PRODUCT', 'QUANTITY');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- PromotionRule table
CREATE TABLE IF NOT EXISTS "PromotionRule" (
  "id"             TEXT NOT NULL,
  "name"           TEXT NOT NULL,
  "description"    TEXT,
  "type"           "PromotionType" NOT NULL,
  "value"          DECIMAL(10,2) NOT NULL,
  "conditionType"  "PromotionConditionType" NOT NULL,
  "conditionValue" TEXT,
  "minQty"         INTEGER,
  "startsAt"       TIMESTAMP(3),
  "endsAt"         TIMESTAMP(3),
  "isActive"       BOOLEAN NOT NULL DEFAULT true,
  "stackable"      BOOLEAN NOT NULL DEFAULT false,
  "priority"       INTEGER NOT NULL DEFAULT 0,
  "maxUses"        INTEGER,
  "usedCount"      INTEGER NOT NULL DEFAULT 0,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PromotionRule_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PromotionRule_isActive_idx" ON "PromotionRule"("isActive");

-- AppliedPromotion table
CREATE TABLE IF NOT EXISTS "AppliedPromotion" (
  "id"              TEXT NOT NULL,
  "orderId"         TEXT NOT NULL,
  "promotionRuleId" TEXT NOT NULL,
  "discountAmount"  DECIMAL(10,2) NOT NULL,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AppliedPromotion_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AppliedPromotion_orderId_idx" ON "AppliedPromotion"("orderId");

DO $$ BEGIN
  ALTER TABLE "AppliedPromotion" ADD CONSTRAINT "AppliedPromotion_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "AppliedPromotion" ADD CONSTRAINT "AppliedPromotion_promotionRuleId_fkey"
    FOREIGN KEY ("promotionRuleId") REFERENCES "PromotionRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ReturnReason enum
DO $$ BEGIN
  CREATE TYPE "ReturnReason" AS ENUM ('DEFECTIVE', 'WRONG_ITEM', 'NOT_AS_DESCRIBED', 'CHANGED_MIND', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ReturnStatus enum
DO $$ BEGIN
  CREATE TYPE "ReturnStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'ITEMS_RECEIVED', 'REFUND_ISSUED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ReturnOrder table
CREATE TABLE IF NOT EXISTS "ReturnOrder" (
  "id"              TEXT NOT NULL,
  "orderId"         TEXT NOT NULL,
  "requestedById"   TEXT NOT NULL,
  "reason"          "ReturnReason" NOT NULL,
  "description"     TEXT,
  "status"          "ReturnStatus" NOT NULL DEFAULT 'REQUESTED',
  "refundAmount"    DECIMAL(10,2),
  "gatewayRefundId" TEXT,
  "adminNotes"      TEXT,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ReturnOrder_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ReturnOrder_orderId_idx" ON "ReturnOrder"("orderId");

DO $$ BEGIN
  ALTER TABLE "ReturnOrder" ADD CONSTRAINT "ReturnOrder_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ReturnItem table
CREATE TABLE IF NOT EXISTS "ReturnItem" (
  "id"            TEXT NOT NULL,
  "returnOrderId" TEXT NOT NULL,
  "orderItemId"   TEXT NOT NULL,
  "quantity"      INTEGER NOT NULL,
  "reason"        TEXT,
  CONSTRAINT "ReturnItem_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "ReturnItem" ADD CONSTRAINT "ReturnItem_returnOrderId_fkey"
    FOREIGN KEY ("returnOrderId") REFERENCES "ReturnOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
