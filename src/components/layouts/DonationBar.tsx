import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export function DonationBar() {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setIsVisible(currentScrollY <= lastScrollY || currentScrollY <= 100);
            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        <div
            className={cn(
                "fixed z-50 bottom-4 w-[640px] bg-black/40 rounded-full backdrop-blur-sm p-4 border-2 border-zinc-800 shadow-lg flex items-center justify-between transition-transform duration-300",
                isVisible ? "translate-y-0" : "translate-y-28"
            )}
            style={{ left: "calc(var(--sidebar-width) + (100vw - var(--sidebar-width)) / 2 - 20rem)" }}>
            <div className="flex items-center justify-between pl-4">
                <div className="text-sm text-white">
                    ❤️ Made by <span className="font-bold">Hardel</span>
                </div>
            </div>
            <Button
                variant="white-shimmer"
                className="text-sm font-bold text-black bg-white rounded-full px-4 py-2 shadow-none cursor-pointer">
                <span className="font-medium leading-none">Support me</span>
            </Button>
        </div>
    );
}
