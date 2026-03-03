'use client'

import Image from 'next/image';
import Link from 'next/link';
import {Route} from "@/lib/client/types";

type Props = {
  focusedIndex: number;
  routes: Route[]
};

export default function RouteViewer(props: Props) {
  const route = props.focusedIndex !== null ? props.routes[props.focusedIndex] : null;

  return (
    <div className={'flex w-[400px] h-full flex-col gap-6 backdrop-blur-xs overflow-hidden px-6 border-l border-grass/20'}>
      {route ? (
        <>
          <Link href={`/routes/${route.id}`} className="block group">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
              <Image
                src={route.thumbnail?.url ?? '/map.png'}
                alt={route.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
            </div>
          </Link>
          <div className="flex flex-col gap-4">
            <div>
              <Link href={`/routes/${route.id}`} className="hover:text-accent-0 transition-colors">
                <h2 className="text-2xl font-bold text-foreground-1 leading-tight">
                  {route.title}
                </h2>
              </Link>
              <div className="text-foreground-1/60 mt-1 flex items-center gap-1.5">
                <span className="text-xs font-bold">by @{route.author.name}</span>
                <span className="opacity-60 text-[10px] font-bold uppercase tracking-[0.3em]">•</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">{route.category.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-0/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-accent-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M11.645 20.91l-.007-.003-.022-.01a15.247 15.247 0 01-.383-.173 25.18 25.18 0 01-4.244-2.673C4.688 16.357 2.25 13.852 2.25 10.5A5.25 5.25 0 017.5 5.25a5.23 5.23 0 014.5 2.508 5.23 5.23 0 014.5-2.508 5.25 5.25 0 015.25 5.25c0 3.352-2.438 5.857-4.739 7.551a25.175 25.175 0 01-4.244 2.673 15.247 15.247 0 01-.383.173l-.022.01-.007.003a.752.752 0 01-.614 0z" />
                </svg>
                {route.likes?.length ?? 0} Likes
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-1/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-accent-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                  <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                </svg>
                {route.views?.length ?? 0} Views
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-foreground-1">Description</h3>
              <p className="text-foreground-1/80 leading-relaxed line-clamp-4">
                {route.description}
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-foreground-1">Route Info</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-background-0 border border-grass/10">
                  <span className="block text-foreground-0 text-[10px] font-bold uppercase tracking-[0.3em]">Created</span>
                  <span className="font-medium text-foreground-1">{new Date(route.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="p-3 rounded-lg bg-background-0 border border-grass/10">
                  <span className="block text-foreground-0 text-[10px] font-bold uppercase tracking-[0.3em]">Waypoints</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground-1">{route.routeNodes.length} stops</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex h-full items-center justify-center text-foreground-1/40 italic">
          Select a route to view details
        </div>
      )}
    </div>
  );
}
