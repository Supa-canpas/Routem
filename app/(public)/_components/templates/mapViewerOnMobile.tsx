'use client'

import {useState, useEffect, useRef} from "react";
import {Map, Marker, Source, Layer, MapRef} from "react-map-gl/mapbox-legacy";
import { Route } from "@/lib/client/types";
import { HiHeart } from "react-icons/hi2";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import 'swiper/css';
import getClientMapboxAccessToken from "@/lib/config/client";
import { useMemo } from "react";
import { MapPin } from "lucide-react";

type Props = {
    routes: Route[];
};

function MobileMap({ route }: { route: Route }) {
    const mapboxAccessToken = getClientMapboxAccessToken();
    const mapRef = useRef<MapRef>(null);

    useEffect(() => {
        if (!route || !route.routeNodes || route.routeNodes.length === 0 || !mapRef.current) return;

        const coords = route.routeNodes
            .filter(node => node.spot && node.spot.longitude !== null && node.spot.latitude !== null)
            .map(node => [node.spot.longitude as number, node.spot.latitude as number]);

        if (coords.length === 0) return;

        if (coords.length === 1) {
            mapRef.current.flyTo({
                center: [coords[0][0], coords[0][1]],
                zoom: 14,
                duration: 2000
            });
        } else {
            const lats = coords.map(c => c[1]);
            const lngs = coords.map(c => c[0]);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLng = Math.min(...lngs);
            const maxLng = Math.max(...lngs);

            mapRef.current.fitBounds(
                [[minLng, minLat], [maxLng, maxLat]],
                { padding: 40, duration: 2000 }
            );
        }
    }, [route]);

    const lineData = useMemo(() => {
        if (!route || !route.routeNodes || route.routeNodes.length < 2) return null;
        const coordinates = route.routeNodes
            .filter(node => node.spot && node.spot.longitude !== null && node.spot.latitude !== null)
            .map(node => [node.spot.longitude as number, node.spot.latitude as number]);

        if (coordinates.length < 2) return null;

        return {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: coordinates
            }
        };
    }, [route]);

    if (!mapboxAccessToken) return (
        <Image
            className="absolute w-full h-full object-cover"
            src="/map.png"
            alt=""
            fill
        />
    );

    return (
        <Map
            ref={mapRef}
            initialViewState={{
                latitude: route.routeNodes?.find(node => node.spot)?.spot.latitude ?? 35.6804,
                longitude: route.routeNodes?.find(node => node.spot)?.spot.longitude ?? 139.7690,
                zoom: 11,
            }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={mapboxAccessToken}
            style={{ width: "100%", height: "100%" }}
        >
            {route.routeNodes?.filter(node => node.spot && node.spot.longitude !== null && node.spot.latitude !== null).map((node, idx) => (
                <Marker
                    key={node.id}
                    longitude={node.spot.longitude as number}
                    latitude={node.spot.latitude as number}
                    anchor="bottom"
                >
                    <div className="flex flex-col items-center">
                        <div className="bg-accent-0 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full mb-0.5 shadow-md border border-white/20 z-10">
                            {idx + 1}
                        </div>
                        <div className="relative flex items-center justify-center">
                            <MapPin
                                size={24}
                                className="text-accent-0 fill-accent-0/20 stroke-[2.5px] drop-shadow-sm"
                            />
                            <div className="absolute w-1.5 h-1.5 bg-white rounded-full translate-y-[-3px]" />
                        </div>
                    </div>
                </Marker>
            ))}

            {lineData && (
                <Source type="geojson" data={lineData as any}>
                    <Layer
                        id={`route-line-${route.id}`}
                        type="line"
                        layout={{
                            "line-join": "round",
                            "line-cap": "round"
                        }}
                        paint={{
                            "line-color": "#2D1FF6",
                            "line-width": 3,
                            "line-opacity": 0.6
                        }}
                    />
                </Source>
            )}
        </Map>
    );
}

export default function MapViewerOnMobile(props: Props) {
    return (
        <div className={'w-full h-[700px] md:hidden block'}>
            <Swiper
                slidesPerView={1}
                spaceBetween={16}
                className="w-full h-full rounded-xl overflow-hidden shadow-md text-foreground-0"
            >
                {props.routes.map((route, index) => (
                    <SwiperSlide key={route.id ?? index}>
                        <div className="w-full h-[700px] flex flex-col rounded-xl overflow-hidden">
                            {/* 上部マップ */}
                            <div className="w-full h-[200px] relative">
                                <MobileMap route={route} />
                                <div className="absolute z-10 h-full w-1/3 p-1 bg-background-0/50 backdrop-blur-sm right-0 bottom-0">
                                    <Image
                                        className="w-full h-full rounded-lg object-cover border border-background-0 shadow-md"
                                        src={route.thumbnail?.url ?? '/map.png'}
                                        alt=""
                                        fill
                                    />
                                </div>
                            </div>

                            {/* 下部コンテンツ */}
                            <div className="w-full flex-1 flex flex-col p-4 gap-2">
                                <h1 className="text-2xl font-bold line-clamp-2">
                                    {route.title}
                                </h1>

                                <div className="text-lg flex items-center gap-2 text-foreground-1">
                                    <div className="relative w-8 h-8">
                                        <Image
                                            className="rounded-full"
                                            src={route.author.icon?.url || "/mockImages/userIcon_1.jpg"}
                                            alt=""
                                            fill
                                        />
                                    </div>
                                    <span>{route.author.name}</span>
                                    <span>・ {route.category?.name}</span>
                                </div>

                                <div className="w-fit flex items-center px-2 py-1 gap-2 text-accent-0 bg-accent-0/10 rounded-full">
                                    <HiHeart />
                                    <span className="text-nowrap">
                                    {route.likes?.length ?? 0} likes
                                </span>
                                </div>

                                <div className="mt-4 flex flex-col gap-3">
                                    <h3 className="text-lg font-semibold text-foreground-1">
                                        Description
                                    </h3>
                                    <p className="text-foreground-1/80 leading-relaxed line-clamp-3">
                                        {route.description}
                                    </p>
                                </div>

                                <div className="mt-4 flex flex-col gap-3">
                                    <h3 className="text-lg font-semibold text-foreground-1">
                                        Route Info
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="p-3 rounded-lg bg-background-0 border border-grass/10">
                                        <span className="block text-foreground-1/40 text-xs">
                                            Created
                                        </span>
                                            <span className="font-medium text-foreground-1">
                                            {new Date(route.createdAt).toLocaleDateString()}
                                        </span>
                                        </div>
                                        <div className="p-3 rounded-lg bg-background-0 border border-grass/10">
                                        <span className="block text-foreground-1/40 text-xs">
                                            Waypoints
                                        </span>
                                            <span className="font-medium text-foreground-1">
                                            {route.routeNodes.length} stops
                                        </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}
