import React, { ComponentPropsWithoutRef, CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface ShimmerBorderProps extends ComponentPropsWithoutRef<"div"> {
    shimmerColor?: string;
    shimmerSize?: string;
    borderRadius?: string;
    shimmerDuration?: string;
    background?: string;
    className?: string;
    children?: React.ReactNode;
}

export const ShimmerBorder = React.forwardRef<
    HTMLDivElement,
    ShimmerBorderProps
>(
    (
        {
            shimmerColor = "#ffffff",
            shimmerSize = "0.05em",
            shimmerDuration = "3s",
            borderRadius = "0.75rem",
            background = "transparent",
            className,
            children,
            ...props
        },
        ref,
    ) => {
        return (
            <div
                style={
                    {
                        "--spread": "90deg",
                        "--shimmer-color": shimmerColor,
                        "--radius": borderRadius,
                        "--speed": shimmerDuration,
                        "--cut": shimmerSize,
                        "--bg": background,
                    } as CSSProperties
                }
                className={cn(
                    "group relative z-0 flex overflow-hidden [background:var(--bg)] [border-radius:var(--radius)]",
                    className,
                )}
                ref={ref}
                {...props}
            >
                {/* spark container */}
                <div
                    className="-z-30 blur-[2px] absolute inset-0 overflow-visible [container-type:size]"
                >
                    {/* spark */}
                    <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
                        {/* spark before */}
                        <div className="absolute -inset-full w-auto rotate-0 animate-spin-around [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
                    </div>
                </div>
                {children}
                <div className="absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]" />
            </div>
        );
    },
);

ShimmerBorder.displayName = "ShimmerBorder";