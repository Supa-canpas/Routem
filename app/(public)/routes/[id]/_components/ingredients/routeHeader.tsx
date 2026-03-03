"use client";

import { Route } from "@/lib/client/types";
import Image from "next/image";
import { HiEye, HiClock, HiBanknotes } from "react-icons/hi2";
import { motion } from "framer-motion";
import LikeButton from "./likeButton";

type RouteHeaderProps = {
  route: Route;
};

export default function RouteHeader({ route }: RouteHeaderProps) {
  const author = route.author;
  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start border-b py-8 border-grass">
      {/* サムネイル画像 - PCでは左側、モバイルでは上部 */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full md:w-2/5 aspect-video md:aspect-[16/10] rounded-2xl overflow-hidden shadow-xl shrink-0"
      >
        <Image
          src={route.thumbnail?.url || "/mockImages/Kyoto.jpg"}
          alt={route.title}
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </motion.div>

      {/* タイトルと基本情報 - PCでは右側、モバイルでは下部 */}
      <div className="flex flex-col gap-4 flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-accent-0 uppercase tracking-[0.3em]">
            {route.category?.name || "Travel Route"}
          </span>
          <span className="text-foreground-1/20">•</span>
          <span className="text-[10px] font-bold text-foreground-1 uppercase tracking-[0.3em]">
            {new Date(route.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground-0 tracking-tight leading-tight uppercase line-clamp-2">
          {route.title}
        </h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <LikeButton 
              routeId={route.id} 
              initialLikesCount={route.likes?.length ?? 0} 
            />
            <div className="flex items-center text-foreground-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
                {route.views?.length ?? 0} views
              </span>
            </div>
          </div>
          <span className="text-foreground-1/20">•</span>
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-accent-0/20">
              <Image
                src={author.icon?.url || "/default-avatar.png"}
                alt={author.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <span className="text-xs font-bold text-foreground-1 normal-case tracking-normal">{author.name}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-1">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-foreground-0/5 rounded-lg border border-foreground-0/5">
            <HiClock className="w-3.5 h-3.5 text-accent-1" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-foreground-1">
              2.5h
            </span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 bg-foreground-0/5 rounded-lg border border-foreground-0/5">
            <HiBanknotes className="w-3.5 h-3.5 text-accent-0" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-foreground-1">
              ¥3,500
            </span>
          </div>
        </div>

        <p className="text-sm md:text-base text-foreground-1 leading-relaxed mt-1 line-clamp-3">
          "{route.description}"
        </p>
      </div>
    </div>
  );
}
