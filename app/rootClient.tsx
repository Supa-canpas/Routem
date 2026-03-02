'use client'

import ScrollDetector from "@/app/_components/layout/templates/scrollDetector";
import Header from "@/app/_components/layout/templates/header";
import Main from "@/app/_components/layout/templates/main";
import { isMobileAtom, scrollDirectionAtom } from "@/lib/client/atoms";
import { useAtomValue, useSetAtom } from "jotai";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

export default function RootClient({ children }: Readonly<{ children: React.ReactNode }>) {

    const scrollDirection = useAtomValue(scrollDirectionAtom)
    const setIsMobile = useSetAtom(isMobileAtom)
    const [headerHeight, setHeaderHeight] = useState(50)

    const updateHeight = useCallback(() => {
        const isMobile = window.innerWidth < 768;
        setIsMobile(isMobile);
        if (!isMobile) {
            setHeaderHeight(60)
        } else {
            setHeaderHeight(50)
        }
    }, [setIsMobile])

    useEffect(() => {
        updateHeight()
        window.addEventListener('resize', updateHeight)
        return () => window.removeEventListener('resize', updateHeight)
    }, [updateHeight])

    return (
        <main className="w-full min-h-dvh overflow-hidden overscroll-none bg-background-1">

            <ScrollDetector />

            {/* ✅ fixed header */}
            <motion.div
                initial={false}
                animate={{
                    y: scrollDirection === 'down' ? -headerHeight : 0,
                }}
                transition={{
                    duration: 0.3,
                    ease: "easeOut"
                }}
                className="fixed top-0 left-0 w-full z-50"
            >
                <Header />
            </motion.div>

            {/* ✅ content */}
            <motion.div
                initial={false}
                animate={{
                    paddingTop: scrollDirection === 'down' ? 0 : headerHeight,
                }}
                transition={{
                    duration: 0.3,
                    ease: "easeOut"
                }}
                className="w-full h-[100svh] text-foreground"
            >
                <Main>{children}</Main>
            </motion.div>

        </main>
    )
}