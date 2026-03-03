"use client";

import { Route } from "@/lib/client/types";
import { User } from "@supabase/supabase-js";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import MapViewer from "./_components/templates/mapViewer";
import DiagramViewer from "./_components/templates/diagramViewer";
import DetailsViewer from "./_components/templates/detailsViewer";
import InitialModal from "./_components/templates/initialModal";
import ViewModeSelector from "./_components/ingredients/viewModeSelector";
import { useAtomValue } from "jotai";
import { scrollDirectionAtom } from "@/lib/client/atoms";
import { useRouteScroll } from "./_components/hooks/useRouteScroll";
import { motion } from "framer-motion";

type Props = {
  route: Route;
  currentUser?: User | null;
};

// RouteItemのフラット化された配列を作成するヘルパー
function getFlattenedItems(route: Route) {
  const items: any[] = [];
  route.routeNodes.forEach((node, index) => {
    // 経由地
    items.push({
      type: "node",
      data: node,
      id: `node-${node.id}`,
      index: items.length,
    });

    // 交通手段（経由地間の移動）
    if (node.transitSteps && node.transitSteps.length > 0) {
      node.transitSteps.forEach((step) => {
        items.push({
          type: "transit",
          data: step,
          id: `transit-${step.id}`,
          index: items.length,
        });
      });
    }
  });
  return items;
}

export default function RootClient({ route, currentUser }: Props) {
  const items = useMemo(() => getFlattenedItems(route), [route]);
  const [viewMode, setViewMode] = useState<"diagram" | "details" | "map">("details");
  const [infoTab, setInfoTab] = useState<"comments" | "related">("comments");
  const [isMobile, setIsMobile] = useState(false);
  const scrollDirection = useAtomValue(scrollDirectionAtom);
  const [yOffset, setYOffset] = useState(0);

  const {
    focusIndex,
    scrollContainerRef,
    itemRefs,
    handleDiagramClick,
  } = useRouteScroll({
    items,
    isMobile,
    viewMode,
    setViewMode,
  });

  const updateOffset = useCallback(() => {
    if (window.innerWidth >= 768) {
      setYOffset(0);
    } else {
      setYOffset(50);
    }
  }, []);

  useEffect(() => {
    updateOffset();
    window.addEventListener("resize", updateOffset);
    return () => window.removeEventListener("resize", updateOffset);
  }, [updateOffset]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="w-full h-[100svh] relative overflow-hidden">
      <InitialModal route={route} />
      
      <div className={`flex h-full w-full overflow-hidden relative flex-col md:flex-row`}>
        <ViewModeSelector
          viewMode={viewMode}
          setViewMode={setViewMode}
          isMobile={isMobile}
          scrollDirection={scrollDirection}
          yOffset={yOffset}
        />

        {/* ダイアグラム (w-1/4 or fixed width) */}
        <motion.div
          layout
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`w-full md:w-1/4 md:min-w-[320px] h-full ${viewMode === 'map' ? 'md:order-2' : 'md:order-1'}`}
        >
          <DiagramViewer 
            items={items}
            focusIndex={focusIndex}
            viewMode={viewMode}
            isMobile={isMobile}
            onItemClick={handleDiagramClick}
          />
        </motion.div>

        {/* 詳細コンテンツ または マップ */}
        <motion.div 
          layout
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`flex-1 relative md:overflow-hidden min-h-screen ${viewMode === "diagram" ? "max-md:hidden" : ""} ${viewMode === 'map' ? 'md:order-1' : 'md:order-2'}`}
        >
          {/* DETAILS VIEW */}
          <DetailsViewer 
            route={route}
            currentUser={currentUser}
            items={items}
            focusIndex={focusIndex}
            viewMode={viewMode}
            infoTab={infoTab}
            setInfoTab={setInfoTab}
            isMobile={isMobile}
            scrollContainerRef={scrollContainerRef}
            itemRefs={itemRefs}
          />

          {/* MAP VIEW */}
          <div 
            className={`md:absolute md:inset-0 max-md:fixed max-md:inset-0 h-screen transition-all duration-500 ease-[0.22, 1, 0.36, 1] ${
              viewMode === "map" ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none invisible"
            }`}
          >
            <MapViewer route={route} focusIndex={focusIndex} items={items} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
