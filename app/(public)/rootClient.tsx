'use client'

import {useEffect, useMemo, useState} from "react";
import ContentsSelector from "@/app/(public)/_components/templates/contentsSelector";
import MapViewerOnLaptop from "@/app/(public)/_components/templates/mapViewerOnLaptop";
import TopUsersList from "@/app/(public)/_components/templates/topUsersList";
import TopRoutesList from "@/app/(public)/_components/templates/topRoutesList";
import RecommendedRoutesList from "@/app/(public)/_components/templates/recommendedRoutesList";
import PhotoViewer from "@/app/(public)/_components/templates/photoViewer";
import RouteListBasic from "@/app/(public)/_components/templates/routeListBasic";
import {GiGreekTemple} from "react-icons/gi";
import {PiForkKnife, PiMountains} from "react-icons/pi";
import {LuPalette} from "react-icons/lu";
import {FaRunning} from "react-icons/fa";
import {IoIosArrowForward} from "react-icons/io";
import {Route, User} from "@/lib/client/types";
import MapViewerOnMobile from "@/app/(public)/_components/templates/mapViewerOnMobile";
import type {RouteVisibility} from "@prisma/client";
import { getDataFromServerWithJson } from "@/lib/client/helpers";

export type selectedType = 'home' | 'photos' | 'interests' | 'recent' | 'trending'

export default function RootClient() {

    // Mock users for demo (this week)
    const mockUsers: any[] = [
        { id: 'u1', name: 'Aki Tanaka', bio: 'City explorer and coffee lover.', icon: { url: '/mockImages/userIcon_1.jpg' }, background: { url: '/mockImages/Nara.jpg' } },
        { id: 'u2', name: 'Kenji Sato', bio: 'Runner and ramen hunter in Kansai.', icon: { url: '/mockImages/userIcon_1.jpg' }, background: { url: '/mockImages/Tokyo.jpg' } },
        { id: 'u3', name: 'Serene Jane', bio: 'History routes and hidden shrines.', icon: { url: '/mockImages/userIcon_1.jpg' }, background: { url: '/mockImages/userProfile.jpg' } },
        { id: 'u4', name: 'Yuta Mori', bio: 'Snowy trails and craft beer enthusiast.', icon: { url: '/mockImages/userIcon_1.jpg' }, background: { url: '/mockImages/Fuji.jpg' } },
        { id: 'u5', name: 'Hana Suzuki', bio: 'Weekend cyclist and bakery map maker from Japan. And Ive Lived in French since last year. Its great and I love here.', icon: { url: '/mockImages/userIcon_1.jpg' }, background: { url: '/mockImages/Kyoto.jpg' } },
        { id: 'u6', name: 'Ren Nakamura', bio: 'Techie who loves riverfront jogs.', icon: { url: '/mockImages/userIcon_1.jpg' }, background: { url: '/mockImages/Hokkaido.jpg' } },
        { id: 'u7', name: 'Sara Ito', bio: 'Nature walks and deer lover in Nara.', icon: { url: '/mockImages/userIcon_1.jpg' }, background: { url: '/mockImages/Hokkaido.jpg' } },
    ]

    // Fetch routes from API
    const [routes, setRoutes] = useState<Route[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    //記事のfetch処理。fetch関数のwrapperやエラー等のハンドリングについては後ほど実行する。
    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const data = await getDataFromServerWithJson<Route[]>('/api/v1/routes?limit=12');
                if (!cancelled && data) setRoutes(data);
            } catch (e: any) {
                if (!cancelled) setError(e?.message ?? 'Failed to load');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true };
    }, []);

    // UIのエラーを回避するためにモック記事をfetchしたroutesに追加する
    const paddedRoutes = useMemo<Route[]>(() => {
        const base = Array.isArray(routes) ? routes : [];
        if (base.length >= 6) return base;
        // pad with placeholders
        const placeholdersNeeded = 6 - base.length;
        const placeholders: Route[] = Array.from({ length: Math.max(0, placeholdersNeeded) }).map((_, i) => ({
            id: `placeholder-${i}`,
            title: `Sample Route ${i + 1}`,
            description: 'This is a sample description for the placeholder route.',
            visibility: "PUBLIC" as RouteVisibility,
            authorId: mockUsers[i % mockUsers.length].id,
            author: {
                ...mockUsers[i % mockUsers.length],
                profileImage: mockUsers[i % mockUsers.length].icon ? { id: `img-u-${i}`, url: mockUsers[i % mockUsers.length].icon, type: 'USER_PROFILE', status: 'ADOPTED', createdAt: new Date(), updatedAt: new Date(), uploaderId: mockUsers[i % mockUsers.length].id, routeNodeId: null, userProfileId: mockUsers[i % mockUsers.length].id, routeThumbId: null } : null,
                gender: null,
                age: null,
            } as any,
            createdAt: new Date(),
            updatedAt: new Date(),
            categoryId: 1,
            category: { id: 1, name: 'General' },
            thumbnail: { id: `thumb-${i}`, url: '/mockImages/Kyoto.jpg', type: 'ROUTE_THUMBNAIL', status: 'ADOPTED', createdAt: new Date(), updatedAt: new Date(), uploaderId: mockUsers[i % mockUsers.length].id, routeNodeId: null, userProfileId: null, routeThumbId: `placeholder-${i}` } as any,
            likes: Array.from({ length: 10 + i * 5 }).map((_, j) => ({ 
                id: `like-${i}-${j}`, 
                createdAt: new Date(), 
                target: 'ROUTE' as const, 
                routeId: `placeholder-${i}`, 
                userId: `u${(j % 7) + 1}`,
                commentId: null
            })),
            views: Array.from({ length: 100 + i * 20 }).map((_, j) => ({ id: `view-${i}-${j}`, createdAt: new Date(), target: 'ROUTE', routeId: `placeholder-${i}`, userId: null })),
            routeNodes: [
                {
                    id: `node-${i}-1`,
                    routeId: `placeholder-${i}`,
                    spotId: 'kyoto-station',
                    details: 'Start from Kyoto Station',
                    spot: {
                        id: 'kyoto-station',
                        name: 'Kyoto Station',
                        longitude: 135.7588,
                        latitude: 34.9858,
                        source: 'mock'
                    }
                },
                {
                    id: `node-${i}-2`,
                    routeId: `placeholder-${i}`,
                    spotId: 'nara-park',
                    details: 'Visit Nara Park',
                    spot: {
                        id: 'nara-park',
                        name: 'Nara Park',
                        longitude: 135.8430,
                        latitude: 34.6851,
                        source: 'mock'
                    }
                }
            ] as any
        }));
        return [...base, ...placeholders];
    }, [routes]);

    const [selected, setSelected] = useState<selectedType>('home')
    return (
        <div className={'w-full max-w-[1600px] h-full flex flex-col items-center md:px-8 px-4 md:pb-8 pb-4 gap-8 relative'}>
            <ContentsSelector selected={selected} setSelected={setSelected}/>
            {(() => {
                switch (selected) {
                    case 'home': return (
                        <div className={'w-full h-fit flex flex-col items-center gap-8'}>
                            {error && <div className={'w-full text-red-500 text-sm'}>{error}</div>}
                            {loading ? (
                                <div className={'w-full text-foreground-1 text-sm'}>Loading routes...</div>
                            ) : (
                                <>
                                    <MapViewerOnLaptop routes={paddedRoutes}/>
                                    <MapViewerOnMobile routes={paddedRoutes}/>
                                    <TopRoutesList routes={paddedRoutes} />
                                    <TopUsersList users={mockUsers}/>
                                    <RecommendedRoutesList routes={paddedRoutes}/>
                                </>
                            )}
                        </div>
                    )
                    case 'photos': return (
                        <PhotoViewer/>
                    )
                    case 'interests': return (
                        <div className={'w-full h-fit flex flex-col gap-8'}>
                            <div className={'w-full flex flex-col gap-2'}>
                                <div className={'py-4 flex flex-row justify-between items-center'}>
                                    <div className={'flex flex-row items-center gap-2 text-foreground-0 font-bold'}>
                                        <GiGreekTemple className={'text-3xl'}/>
                                        <h2 className={'text-2xl'}>History</h2>
                                    </div>
                                    <div className={'flex flex-row items-center gap-2 text-foreground-1 cursor-pointer'}>
                                        <h2 className={'text-lg'}>View More</h2>
                                        <IoIosArrowForward className={'text-xl'}/>
                                    </div>
                                </div>
                                <RouteListBasic routes={paddedRoutes}/>
                            </div>
                            <div className={'w-full flex flex-col gap-2'}>
                                <div className={'py-4 flex flex-row justify-between items-center'}>
                                    <div className={'flex flex-row items-center gap-2 text-foreground-0 font-bold'}>
                                        <PiMountains className={'text-3xl'}/>
                                        <h2 className={'text-2xl'}>Nature</h2>
                                    </div>
                                    <div className={'flex flex-row items-center gap-2 text-foreground-1 cursor-pointer'}>
                                        <h2 className={'text-lg'}>View More</h2>
                                        <IoIosArrowForward className={'text-xl'}/>
                                    </div>
                                </div>
                                <RouteListBasic routes={paddedRoutes}/>
                            </div>
                            <div className={'w-full flex flex-col gap-2'}>
                                <div className={'py-4 flex flex-row justify-between items-center'}>
                                    <div className={'flex flex-row items-center gap-2 text-foreground-0 font-bold'}>
                                        <LuPalette className={'text-3xl'}/>
                                        <h2 className={'text-2xl'}>Culture</h2>
                                    </div>
                                    <div className={'flex flex-row items-center gap-2 text-foreground-1 cursor-pointer'}>
                                        <h2 className={'text-lg'}>View More</h2>
                                        <IoIosArrowForward className={'text-xl'}/>
                                    </div>
                                </div>
                                <RouteListBasic routes={paddedRoutes}/>
                            </div>
                            <div className={'w-full flex flex-col gap-2'}>
                                <div className={'py-4 flex flex-row justify-between items-center'}>
                                    <div className={'flex flex-row items-center gap-2 text-foreground-0 font-bold'}>
                                        <PiForkKnife className={'text-3xl'}/>
                                        <h2 className={'text-2xl'}>Food</h2>
                                    </div>
                                    <div className={'flex flex-row items-center gap-2 text-foreground-1 cursor-pointer'}>
                                        <h2 className={'text-lg'}>View More</h2>
                                        <IoIosArrowForward className={'text-xl'}/>
                                    </div>
                                </div>
                                <RouteListBasic routes={paddedRoutes}/>
                            </div>
                            <div className={'w-full flex flex-col gap-2'}>
                                <div className={'py-4 flex flex-row justify-between items-center'}>
                                    <div className={'flex flex-row items中心 gap-2 text-foreground-0 font-bold'}>
                                        <FaRunning className={'text-3xl'}/>
                                        <h2 className={'text-2xl'}>Activity</h2>
                                    </div>
                                    <div className={'flex flex-row items-center gap-2 text-foreground-1 cursor-pointer'}>
                                        <h2 className={'text-lg'}>View More</h2>
                                        <IoIosArrowForward className={'text-xl'}/>
                                    </div>
                                </div>
                                <RouteListBasic routes={paddedRoutes}/>
                            </div>
                        </div>
                    )
                    case 'recent': return <></>
                    case 'trending': return <></>
                }
            })()}
        </div>
    )
}
