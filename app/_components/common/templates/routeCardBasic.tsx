import { Route } from "@/lib/client/types"
import React from "react";
import {Icon} from "@mui/material";
import {HiEye, HiHeart} from "react-icons/hi2";
import Image from "next/image";
import Link from "next/link";

type Props = {
    route: Route
}
export default function RouteCardBasic(props: Props) {
    return (
        <Link href={`/routes/${props.route.id}`} className={'group w-full h-[320px] overflow-hidden rounded-2xl flex shadow-sm hover:shadow-2xl transition-shadow duration-700 bg-background-0 p-2 gap-2'}>
            <div className={'flex-1 h-full relative overflow-hidden rounded-xl'}>
                {/* オーバーレイ（視認性向上） - Smoother blur gradient with masked blur to avoid sharp boundary */}
                <div className="absolute inset-0 z-10 rounded-xl overflow-hidden
                    backdrop-blur-md bg-black/35
                    [mask-image:linear-gradient(to_top,black,transparent)]
                    [-webkit-mask-image:linear-gradient(to_top,black,transparent)]" />
                <Image
                    src={props.route.thumbnail?.url ?? '/map.png'}
                    alt={props.route.title}
                    fill
                    className={'object-cover group-hover:scale-110 duration-700 ease-out'}
                    unoptimized
                />
                <div className={'absolute left-0 bottom-0 w-full p-6 flex flex-col items-start gap-2 z-15'}>
                    <h2 className={'text-3xl font-bold text-white text-left leading-tight drop-shadow-md'}>{props.route.title}</h2>
                    <div className="flex items-center gap-2 text-white/80">
                        <span className="text-xs font-bold bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full">by @{props.route.author.name}</span>
                    </div>
                </div>
            </div>
            <div className={'w-[45%] h-full min-w-[160px] flex flex-col gap-4 p-6 bg-background-1 rounded-xl'}>
                <div className="w-full flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full">
                            <div className="relative w-full h-full">
                                <Image
                                    src={props.route.author.icon?.url || "/mockImages/userIcon_2.jpg"}
                                    alt={props.route.author.name}
                                    fill
                                    className="rounded-full object-cover"
                                    unoptimized
                                />
                            </div>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h4 className="text-sm font-bold truncate text-foreground-0">{props.route.author.name}</h4>
                            <span className="text-[10px] font-bold text-foreground-1 uppercase tracking-[0.2em]">{props.route.category?.name}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <HiHeart className="w-4 h-4 text-accent-0" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-1">{props.route.likes?.length ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <HiEye className="w-4 h-4 text-accent-1" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-1">{props.route.views?.length ?? 0}</span>
                        </div>
                    </div>
                </div>
                <div className="w-full grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-background-0 p-2 flex flex-col justify-center">
                        <span className="block text-foreground-0 text-[9px] font-bold uppercase tracking-[0.2em] mb-0.5">Stops</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-foreground-0 truncate">{props.route.routeNodes.length} pts</span>
                    </div>
                    <div className="rounded-lg bg-background-0 p-2 flex flex-col justify-center">
                        <span className="block text-foreground-0 text-[9px] font-bold uppercase tracking-[0.2em] mb-0.5">Category</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-foreground-0 truncate">{props.route.category?.name}</span>
                    </div>
                </div>
                <div className={'w-full text-foreground-1 line-clamp-5 md:text-sm text-xs leading-relaxed'}>
                    "{props.route.description}"
                </div>
            </div>
        </Link>
    )
}

