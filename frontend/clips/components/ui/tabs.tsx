"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex h-12 w-full items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative isolate rounded-full px-4 py-2 text-sm font-medium text-slate-400 transition duration-200 hover:bg-white/5 hover:text-white data-[state=active]:-translate-y-px data-[state=active]:bg-card data-[state=active]:text-white data-[state=active]:shadow-[0_12px_28px_rgba(0,0,0,0.35)] data-[state=active]:ring-1 data-[state=active]:ring-primary/25 data-[state=active]:before:absolute data-[state=active]:before:inset-x-4 data-[state=active]:before:bottom-1 data-[state=active]:before:h-px data-[state=active]:before:rounded-full data-[state=active]:before:bg-gradient-to-r data-[state=active]:before:from-primary/20 data-[state=active]:before:via-primary data-[state=active]:before:to-primary/20",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn("mt-4 outline-none", className)} {...props} />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
