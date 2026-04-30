
"use client";

import { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

const TabsContext = createContext<{ value: string; onChange: (v: string) => void }>({ value: "", onChange: () => {} });

export function Tabs({ defaultValue, children, className }: { defaultValue?: string; children: React.ReactNode; className?: string }) {
  const [value, setValue] = useState(defaultValue || "");
  return (
    <TabsContext.Provider value={{ value, onChange: setValue }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("inline-flex h-10 items-center rounded-lg bg-neutral-100 p-1", className)} {...props} />;
}

export function TabsTrigger({ value, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const ctx = useContext(TabsContext);
  return (
    <button
      className={cn(
        "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
        ctx.value === value ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-black",
        className
      )}
      onClick={() => ctx.onChange(value)}
      {...props}
    />
  );
}

export function TabsContent({ value, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const ctx = useContext(TabsContext);
  if (ctx.value !== value) return null;
  return <div className={cn("mt-2", className)} {...props} />;
}
