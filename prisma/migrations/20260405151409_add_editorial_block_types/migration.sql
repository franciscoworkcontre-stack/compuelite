-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BlockType" ADD VALUE 'EDITORIAL';
ALTER TYPE "BlockType" ADD VALUE 'BENCHMARK_GRID';
ALTER TYPE "BlockType" ADD VALUE 'AI_CAPABILITY';
ALTER TYPE "BlockType" ADD VALUE 'COMMUNITY_BUILD';
ALTER TYPE "BlockType" ADD VALUE 'DUAL_AUDIENCE';
ALTER TYPE "BlockType" ADD VALUE 'STOCK_TICKER';
ALTER TYPE "BlockType" ADD VALUE 'QUIZ_FLOW';
