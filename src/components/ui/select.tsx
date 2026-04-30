
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";

interface SelectProps {
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Select({ options, value, onChange, placeholder = "Sélectionner...", className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border px-3 py-2 text-sm",
          open ? "border-neutral-400" : "border-neutral-300",
          "bg-white hover:border-neutral-400 transition-colors"
        )}
      >
        <span className={selected ? "text-black" : "text-neutral-400"}>{selected?.label || placeholder}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-neutral-200 bg-white shadow-lg z-50">
          <div className="max-h-60 overflow-auto p-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange?.(opt.value); setOpen(false); }}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-neutral-100",
                  value === opt.value && "bg-neutral-100"
                )}
              >
                {opt.label}
                {value === opt.value && <Check className="w-4 h-4 text-mint" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
