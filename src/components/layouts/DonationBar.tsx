import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export function DonationBar() {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            // Hide when scrolling down after 150px, show when scrolling up
            const shouldShow = currentScrollY <= lastScrollY || currentScrollY <= 150;
            setIsVisible(shouldShow);
            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        <div
            className={cn(
                "fixed z-50 bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] max-w-sm bg-black/40 rounded-full backdrop-blur-sm border-2 border-zinc-800 shadow-lg transition-all duration-300",
                "sm:bottom-4 sm:max-w-md sm:w-auto sm:min-w-[400px]",
                "lg:max-w-lg lg:min-w-[500px] lg:left-[calc(var(--sidebar-width)+(100vw-var(--sidebar-width))/2)]",
                "xl:max-w-xl xl:min-w-[600px]",
                isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
            )}>
            <div className="flex items-center justify-between gap-3 px-3 py-2 sm:px-4 sm:py-3">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base sm:text-lg">❤️</span>
                    <div className="text-xs text-white sm:text-sm">
                        Made by <span className="font-bold">Hardel</span>
                    </div>
                </div>
                <Button
                    asChild
                    variant="white-shimmer"
                    className="text-xs font-bold text-black bg-white rounded-full px-3 py-1.5 shadow-none cursor-pointer flex-shrink-0 sm:text-sm sm:px-4 sm:py-2">
                    <a
                        href="https://github.com/sponsors/Hardel-DW"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium leading-none">
                        <span className="hidden sm:inline">Support me</span>
                        <span className="sm:hidden">Support</span>
                    </a>
                </Button>
            </div>
        </div>
    );
}
