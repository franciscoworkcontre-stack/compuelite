-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('ANNOUNCEMENT', 'PROMO_BANNER', 'PRODUCT_SPOT', 'COUNTDOWN');

-- CreateTable
CREATE TABLE "ContentBlock" (
    "id" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "type" "BlockType" NOT NULL,
    "data" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentBlock_zone_active_idx" ON "ContentBlock"("zone", "active");
