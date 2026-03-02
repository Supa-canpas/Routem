'use client'

import {useState, useEffect, useRef} from "react";
import {Map, Marker, Source, Layer, MapRef} from "react-map-gl/mapbox-legacy";
import RouteList from "@/app/(public)/_components/ingredients/routeList";
import RouteViewer from "@/app/(public)/_components/ingredients/routeViewer";
import RouteFilter from "@/app/(public)/_components/ingredients/routeFilter";
import {Route} from "@/lib/client/types";
import getClientMapboxAccessToken from "@/lib/config/client";
import { useMemo } from "react";
import { MapPin } from "lucide-react";

type Props = {
    routes: Route[]
}

export default function MapViewerOnLaptop(props: Props) {
    const [focusedRouteIndex, setFocusedRouteIndex] = useState<number>(1);
    const mapRef = useRef<MapRef>(null);

    const mapboxAccessToken = getClientMapboxAccessToken()

    const focusedRoute = props.routes[focusedRouteIndex];

    useEffect(() => {
        if (!focusedRoute || !focusedRoute.routeNodes || focusedRoute.routeNodes.length === 0 || !mapRef.current) return;

        const coords = focusedRoute.routeNodes
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
                { padding: 80, duration: 2000 }
            );
        }
    }, [focusedRoute]);

    const lineData = useMemo(() => {
        if (!focusedRoute || !focusedRoute.routeNodes || focusedRoute.routeNodes.length < 2) return null;
        const coordinates = focusedRoute.routeNodes
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
    }, [focusedRoute]);

    if(!mapboxAccessToken) return (
        <p>マップボックスのアクセストークンが存在しません。</p>
    )


    return (
        <div className={'w-full rounded-2xl h-fit overflow-hidden relative md:block hidden'}>
            <div className={'w-full h-[600px] flex flex-row border-b-1 border-grass/20'}>
                <div className={'flex-1 h-full bg-background-1 relative'} onWheel={e => e.stopPropagation()}>
                    {/* マップ上のオーバーレイなどが必要な場合はここに追加 */}
                    <Map
                        ref={mapRef}
                        initialViewState={{
                            latitude: focusedRoute?.routeNodes?.find(node => node.spot)?.spot.latitude ?? 35.6804,
                            longitude: focusedRoute?.routeNodes?.find(node => node.spot)?.spot.longitude ?? 139.7690,
                            zoom: 12,
                        }}
                        mapStyle="mapbox://styles/mapbox/streets-v12"
                        mapboxAccessToken={mapboxAccessToken}
                        style={{ width: "100%", height: "100%" }}
                    >
                        {focusedRoute?.routeNodes?.filter(node => node.spot && node.spot.longitude !== null && node.spot.latitude !== null).map((node, idx) => (
                            <Marker
                                key={node.id}
                                longitude={node.spot.longitude as number}
                                latitude={node.spot.latitude as number}
                                anchor="bottom"
                            >
                                <MapPin
                                    size={32}
                                    className="text-accent-0 fill-accent-0/20 stroke-[2.5px] drop-shadow-sm"
                                />
                            </Marker>
                        ))}

                        {lineData && (
                            <Source type="geojson" data={lineData as any}>
                                <Layer
                                    id="route-line"
                                    type="line"
                                    layout={{
                                        "line-join": "round",
                                        "line-cap": "round"
                                    }}
                                    paint={{
                                        "line-color": "red",
                                        "line-width": 4,
                                        "line-opacity": 0.6
                                    }}
                                />
                            </Source>
                        )}
                    </Map>
                </div>
                <RouteViewer focusedIndex={focusedRouteIndex} routes={props.routes}/>
                <RouteList focusedIndex={focusedRouteIndex} routes={props.routes} setFocusedIndex={setFocusedRouteIndex} />
            </div>
            <RouteFilter/>
        </div>
    )
}
