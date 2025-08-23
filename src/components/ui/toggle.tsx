import { Root } from "@radix-ui/react-toggle";
import type { VariantProps } from "class-variance-authority";
import React from "react";
import { cn } from "@/lib/utils";
import { toggleVariants } from "./toggle-variants";

const Toggle = React.forwardRef<
    React.ElementRef<typeof Root>,
    React.ComponentPropsWithoutRef<typeof Root> & VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
    <Root ref={ref} className={cn(toggleVariants({ variant, size, className }))} {...props} />
));

Toggle.displayName = Root.displayName;

export { Toggle };
