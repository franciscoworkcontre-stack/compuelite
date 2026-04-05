import { api } from "@/lib/trpc/server";
import type { BlockType } from "@prisma/client";
import {
  AnnouncementBlock,
  PromoBannerBlock,
  ProductSpotBlock,
  CountdownBlock,
  EditorialBlock,
  BenchmarkGridBlock,
  AiCapabilityBlock,
  CommunityBuildBlock,
  DualAudienceBlock,
  StockTickerBlock,
  QuizFlowBlock,
  type AnnouncementData,
  type PromoBannerData,
  type ProductSpotData,
  type CountdownData,
  type EditorialData,
  type BenchmarkGridData,
  type AiCapabilityData,
  type CommunityBuildData,
  type DualAudienceData,
  type StockTickerData,
  type QuizFlowData,
} from "./blocks";

interface Props {
  zone: string;
}

export async function ContentZone({ zone }: Props) {
  let blocks: Awaited<ReturnType<typeof api.content.byZone>>;
  try {
    blocks = await api.content.byZone({ zone });
  } catch {
    return null;
  }

  if (!blocks.length) return null;

  return (
    <>
      {blocks.map((block) => (
        <BlockRenderer key={block.id} type={block.type} data={block.data} />
      ))}
    </>
  );
}

function BlockRenderer({ type, data }: { type: BlockType; data: unknown }) {
  switch (type) {
    case "ANNOUNCEMENT":    return <AnnouncementBlock    data={data as AnnouncementData}    />;
    case "PROMO_BANNER":    return <PromoBannerBlock      data={data as PromoBannerData}      />;
    case "PRODUCT_SPOT":    return <ProductSpotBlock      data={data as ProductSpotData}      />;
    case "COUNTDOWN":       return <CountdownBlock        data={data as CountdownData}        />;
    case "EDITORIAL":       return <EditorialBlock        data={data as EditorialData}        />;
    case "BENCHMARK_GRID":  return <BenchmarkGridBlock    data={data as BenchmarkGridData}    />;
    case "AI_CAPABILITY":   return <AiCapabilityBlock     data={data as AiCapabilityData}     />;
    case "COMMUNITY_BUILD": return <CommunityBuildBlock   data={data as CommunityBuildData}   />;
    case "DUAL_AUDIENCE":   return <DualAudienceBlock     data={data as DualAudienceData}     />;
    case "STOCK_TICKER":    return <StockTickerBlock      data={data as StockTickerData}      />;
    case "QUIZ_FLOW":       return <QuizFlowBlock         data={data as QuizFlowData}         />;
    default:                return null;
  }
}
