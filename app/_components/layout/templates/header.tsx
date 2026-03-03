'use client'

import { useState } from "react";
import { MdMenu, MdSearch } from "react-icons/md";
import PageTitle from "@/app/_components/layout/ingredients/pageTitle";
import NavigatorList from "@/app/_components/layout/ingredients/navigatorList";
import SearchBar from "@/app/_components/layout/ingredients/searchBar";
import MobileMenu from "@/app/_components/layout/ingredients/mobileMenu";

export default function Header () {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchMode, setIsSearchMode] = useState(false);

    return (
        <header
            className={`block sticky top-0 w-full h-[50px] md:h-[60px] bg-background-1 border-b border-grass box-border z-[100]`}
        >
            <div className={'px-6 w-full h-full flex items-center max-w-[1440px] mx-auto gap-1 sm:gap-2 md:gap-4 lg:gap-8'}>
                {!isSearchMode ? (
                    <>
                        <button 
                            className={'lg:hidden p-2 -ml-2 hover:bg-grass rounded-full transition-colors cursor-pointer'}
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <MdMenu size={24} className={'text-foreground-0'} />
                        </button>

                        <PageTitle />

                        <div className={'hidden lg:block'}>
                            <SearchBar />
                        </div>

                        <div className={'flex items-center gap-8 flex-1'}>
                            <NavigatorList />
                        </div>

                        <button 
                            className={'lg:hidden p-2 hover:bg-grass rounded-full transition-colors cursor-pointer'}
                            onClick={() => setIsSearchMode(true)}
                        >
                            <MdSearch size={24} className={'text-foreground-0'} />
                        </button>
                    </>
                ) : (
                    <div className="w-full flex items-center lg:hidden">
                        <SearchBar onBack={() => setIsSearchMode(false)} isMobileOnly />
                    </div>
                )}
            </div>

            <MobileMenu 
                isOpen={isMobileMenuOpen} 
                onClose={() => setIsMobileMenuOpen(false)} 
            />
        </header>
    )
}
