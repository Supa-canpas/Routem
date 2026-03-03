"use client";

import { Route } from "@/lib/client/types";
import { MessageSquare, BookOpen } from "lucide-react";
import { HiHeart } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, RefObject } from "react";
import { User } from "@supabase/supabase-js";
import RelatedArticles from "./relatedArticles";
import WaypointItem from "../ingredients/waypointItem";
import TransitItem from "../ingredients/transitItem";
import RouteHeader from "../ingredients/routeHeader";
import AuthorSection from "../ingredients/authorSection";
import CategoryTags from "../ingredients/categoryTags";
import LikeButton from "../ingredients/likeButton";
import CommentSection from "./commentSection";
import { getTransitIcon } from "../ingredients/transitIcon";

type Props = {
  route: Route;
  items: any[];
  focusIndex: number;
  viewMode: "diagram" | "details" | "map";
  infoTab?: "comments" | "related";
  setInfoTab?: (tab: "comments" | "related") => void;
  isMobile: boolean;
  currentUser?: User | null;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  itemRefs: RefObject<(HTMLDivElement | null)[]>;
};

export default function DetailsViewer({
  route,
  items,
  focusIndex,
  viewMode,
  infoTab = "comments",
  setInfoTab,
  isMobile,
  currentUser,
  scrollContainerRef,
  itemRefs,
}: Props) {
  const isLikedByMe = !!(currentUser && route.likes?.some((like) => like.userId === currentUser.id));

  return (
    <div
      ref={scrollContainerRef}
      className={`w-full h-full overflow-y-scroll px-8 pt-4 pb-40 flex flex-col gap-16 transition-all duration-500 border-l border-grass ${
        viewMode === "details"
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-12 pointer-events-none invisible max-md:hidden max-md:h-0 max-md:overflow-hidden"
      }`}
    >
      <RouteHeader route={route} />

      {items.map((item, idx) => (
        <div key={item.id}>
          {item.type === "node" ? (
            <WaypointItem
              idx={idx}
              data={item.data}
              isFocused={focusIndex === idx}
              itemRef={(el) => {
                if (itemRefs.current) {
                  itemRefs.current[idx] = el;
                }
              }}
            />
          ) : (
            <TransitItem
              data={item.data}
              isFocused={focusIndex === idx}
              itemRef={(el) => {
                if (itemRefs.current) {
                  itemRefs.current[idx] = el;
                }
              }}
            />
          )}
        </div>
      ))}
      
      {/* ルートを気に入った場合のいいねボタン */}
      <div className="flex flex-col items-center gap-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground-1">Did you enjoy this route?</span>
        <LikeButton 
          routeId={route.id} 
          initialLikesCount={route.likes?.length ?? 0} 
          initialIsLiked={isLikedByMe}
          variant="large" 
        />
      </div>

      {/* 情報エリア (投稿者, カテゴリー, タグ, コメント/関連記事) */}
      <div
        ref={(el) => {
          if (itemRefs.current) {
            itemRefs.current[items.length] = el;
          }
        }}
        className={`transition-all duration-700 ease-[0.22, 1, 0.36, 1] border-t pt-16 border-grass ${
          focusIndex === items.length ? "opacity-100" : "opacity-40"
        }`}
      >
        <div className="flex flex-col gap-20">
          {/* 上部: 投稿者とカテゴリー/タグ */}
          <div className="max-w-4xl flex flex-col gap-12">
            <AuthorSection author={route.author} />
            <CategoryTags category={route.category} />
          </div>

          {/* 下部: タブ切り替えエリア (Comments / Related Articles) */}
          <div className="flex flex-col gap-8">
            {isMobile && (
              <div className="flex items-center gap-8 border-b border-foreground-0/5">
                <button
                  onClick={() => setInfoTab?.("comments")}
                  className={`pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${
                    infoTab === "comments" ? "text-accent-0" : "text-foreground-1 hover:text-foreground-0"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Comments</span>
                  </div>
                  {infoTab === "comments" && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-0" />
                  )}
                </button>
                <button
                  onClick={() => setInfoTab?.("related")}
                  className={`pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${
                    infoTab === "related" ? "text-accent-0" : "text-foreground-1 hover:text-foreground-0"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Related Articles</span>
                  </div>
                  {infoTab === "related" && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-0" />
                  )}
                </button>
              </div>
            )}

            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {!isMobile || infoTab === "comments" ? (
                  <CommentSection key="comments" isMobile={isMobile} routeId={route.id} />
                ) : (
                  <motion.div
                    key="related"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    <RelatedArticles />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
