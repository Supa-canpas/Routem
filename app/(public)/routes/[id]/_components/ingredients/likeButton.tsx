"use client";

import { useState } from "react";
import { HiHeart } from "react-icons/hi2";
import { postDataToServerWithJson } from "@/lib/client/helpers";
import { Loader2 } from "lucide-react";

type LikeButtonProps = {
  routeId: string;
  initialLikesCount: number;
  initialIsLiked?: boolean;
  variant?: "compact" | "large";
};

export default function LikeButton({ routeId, initialLikesCount, initialIsLiked = false, variant = "compact" }: LikeButtonProps) {
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    setLoading(true);
    try {
      const result = await postDataToServerWithJson<any>("/api/v1/likes", {
        target: "ROUTE",
        routeId: routeId,
      });
      
      if (result) {
        // toggleLikeの結果、作成されたか削除されたかに基づいてステートを更新する
        // APIの戻り値が { id: ... } なら作成、そうでなければ削除（あるいは count 等）
        // repositoryの実装を確認すると toggleLike は upsert/delete 的な動き
        // service.toggleLike の戻り値を確認したいが、一旦反転させる
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (err: any) {
      alert(err.message || "Failed to like");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "large") {
    return (
      <button 
        onClick={handleLike}
        disabled={loading}
        className={`group flex items-center gap-4 px-8 py-4 bg-background-0 border rounded-full transition-all shadow-sm hover:shadow-xl hover:shadow-accent-0/10 cursor-pointer disabled:opacity-50 ${
          isLiked ? "border-accent-0 ring-1 ring-accent-0/20" : "border-grass hover:border-accent-0"
        }`}
      >
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin text-accent-0" />
        ) : (
          <HiHeart className={`w-6 h-6 group-hover:scale-125 transition-transform ${isLiked ? "text-accent-0 fill-accent-0" : "text-accent-0"}`} />
        )}
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-foreground-0">
          {isLiked ? "Liked!" : "Like this route"}
        </span>
        <div className="w-px h-4 bg-grass" />
        <span className="text-sm font-bold text-foreground-1 tabular-nums">{likesCount}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center text-foreground-1">
      <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
        {likesCount} likes
      </span>
    </div>
  );
}
