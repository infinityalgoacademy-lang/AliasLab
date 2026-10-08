"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
           "peer cursor-pointer data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/25 focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent shadow-sm transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 relative overflow-hidden flex-row-reverse",
        className
      )}
      {...props}
    >
       <SwitchPrimitive.Thumb
         data-slot="switch-thumb"
         className={cn(
           "bg-background pointer-events-none block size-3.5 rounded-full shadow-md ring-0 transition-transform duration-200 ease-in-out data-[state=checked]:translate-x-[-18px] data-[state=unchecked]:translate-x-[-0.5]"
         )}
       />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
