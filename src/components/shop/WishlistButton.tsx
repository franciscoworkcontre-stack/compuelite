"use client";

import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc/client";
import { useWishlistStore } from "@/stores/wishlistStore";

export function WishlistButton({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const { toggle: localToggle, has: localHas } = useWishlistStore();

  // Authenticated: use server-side wishlist
  const utils = trpc.useUtils();
  const { data } = trpc.wishlist.isInList.useQuery(
    { productId },
    { enabled: !!session }
  );
  const toggleMutation = trpc.wishlist.toggle.useMutation({
    onSuccess: () => {
      utils.wishlist.isInList.invalidate({ productId });
      utils.wishlist.list.invalidate();
    },
  });

  const inWishlist = session ? (data?.inWishlist ?? false) : localHas(productId);

  const handleClick = () => {
    if (session) {
      toggleMutation.mutate({ productId });
    } else {
      localToggle(productId);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={toggleMutation.isPending}
      className={`p-4 rounded border transition-all ${
        inWishlist
          ? "border-[#ff3333]/40 text-[#ff3333] bg-[#ff3333]/10 hover:bg-[#ff3333]/20"
          : "border-[#222] text-[#888] hover:border-[#00ff66]/30 hover:text-[#00ff66]"
      }`}
      title={inWishlist ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      <svg className="w-5 h-5" fill={inWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}
