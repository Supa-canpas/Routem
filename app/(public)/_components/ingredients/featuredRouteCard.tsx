import Link from 'next/link';
import React from 'react'
import { BiHash } from 'react-icons/bi'
import {HiHeart, HiClock, HiBanknotes, HiEye} from 'react-icons/hi2'
import {Route} from "@/lib/client/types";
import Image from 'next/image';

export type Props = {
  route: Route
  onClick?: () => void
}

export default function FeaturedRouteCard(props: Props) {

  return (
    <Link
      href={`/routes/${props.route.id}`}
      onClick={props.onClick}
      className="group relative block w-full h-full rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 bg-background-0 p-2"
      aria-label={`Top route: ${props.route.title}`}
    >
      {/* Background Image with Margin (via container padding) */}
      <div className="relative w-full h-full rounded-lg overflow-hidden">
        <Image
          src={props.route.thumbnail?.url || '/mockImages/Kyoto.jpg'}
          alt={`${props.route.title} background`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          unoptimized
        />

        {/* Gradient Mask Overlay (Top to Bottom) with Smooth Blur - Inside the image container */}
        <div className="absolute inset-0 rounded-lg overflow-hidden
      backdrop-blur-2xl bg-black/50
      [mask-image:linear-gradient(to_bottom,transparent_10%,black_80%)]
      [-webkit-mask-image:linear-gradient(to_bottom,transparent_10%,black_80%)]" />

        {/* Content Container (Padding around edges) - Inside the image container */}
        <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
          {/* Top section: Rank on the right */}
          <div className="flex justify-end items-start">
            <div className="theme-reversed flex items-center justify-center w-10 h-10 bg-background-1 text-foreground-0 text-xs font-bold rounded-full border border-black/10 shadow-sm">
              1st
            </div>
          </div>

          {/* Bottom section: Title, Meta, and Detail Chips (styled like RouteCardGraphical) */}
          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="md:text-3xl text-xl font-bold leading-tight drop-shadow-sm line-clamp-2 text-white">
                {props.route.title}
              </h3>
              <div className="flex items-center gap-1.5 truncate mr-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/90">
                <span className="text-xs font-bold normal-case tracking-normal">@{props.route.author.name}</span>
                <span className="opacity-60">•</span>
                <span className="truncate">{props.route.category?.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-[10px] font-bold uppercase tracking-[0.3em] text-white/80">
                <div className="flex items-center gap-1">
                  <HiHeart className="w-4 h-4 text-accent-0" />
                  <span className="tabular-nums">{props.route.likes?.length ?? 0}</span>
                  <span className="truncate">likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <HiEye className="w-4 h-4 text-accent-1" />
                  <span className="tabular-nums">{props.route.views?.length ?? 0}</span>
                  <span className="truncate">views</span>
                </div>
              </div>
            </div>

            {/* Duration and Cost area (Button-like) */}
            <div className="flex gap-2">
              <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 backdrop-blur-md rounded-full shadow-inner bg-background-1 text-foreground-0 transition-colors">
                <HiClock className="w-4 h-4 text-foreground-0" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">2.5h</span>
              </div>
              <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 backdrop-blur-md rounded-full shadow-inner bg-background-1 text-foreground-0 transition-colors">
                <HiBanknotes className="w-4 h-4 text-foreground-0" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">¥3,500</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
