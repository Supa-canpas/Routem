"use client";

import { useEffect, useRef, useMemo } from "react";
import { Map, Marker, Source, Layer, MapRef } from "react-map-gl/mapbox-legacy";
import { Route } from "@/lib/client/types";
import { MapPin } from "lucide-react";
import getClientMapboxAccessToken from "@/lib/config/client";

type Props = {
  route: Route;
  focusIndex?: number;
  items?: any[];
};

export default function MapViewer({ route, focusIndex, items }: Props) {
  const mapRef = useRef<MapRef>(null);
  const mapboxAccessToken = getClientMapboxAccessToken();

  useEffect(() => {
    if (!route || !route.routeNodes || route.routeNodes.length === 0 || !mapRef.current) return;

    // focusIndexが有効な範囲内かつ、itemsが存在する場合
    if (items && focusIndex !== undefined && focusIndex >= 0 && focusIndex < items.length) {
      const focusedItem = items[focusIndex];
      
      // Node（経由地）の場合のみズームする
      if (focusedItem.type === "node" && focusedItem.data?.spot) {
        const { longitude, latitude } = focusedItem.data.spot;
        mapRef.current.flyTo({
          center: [longitude, latitude],
          zoom: 15,
          duration: 2000,
          essential: true
        });
        return; // 個別地点にズームした場合は全体表示は行わない
      }
    }

    // 初期表示またはfocusIndexがWaypoint以外の場合（全体を表示）
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
        { padding: 80, duration: 2000 }
      );
    }
  }, [route, focusIndex, items]);

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
    <div className="absolute inset-0 bg-background-1 flex items-center justify-center">
      <p className="text-foreground-1 text-sm font-bold uppercase tracking-widest">Mapbox Access Token Required</p>
    </div>
  );

  return (
    <div className="absolute inset-0 z-0">
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
                "line-width": 4,
                "line-opacity": 0.6
              }}
            />
          </Source>
        )}
      </Map>
    </div>
  );
}
