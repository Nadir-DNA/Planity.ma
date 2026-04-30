
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";

interface NotificationBellProps {
  count: number;
  className?: string;
}

export function NotificationBell({ count, className }: NotificationBellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <button onClick={() => setOpen(!open)} className="p-2 rounded-full hover:bg-neutral-100 relative">
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-mint text-black text-xs font-bold flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border bg-white shadow-lg z-50 p-4">
          <p className="text-sm text-center text-neutral-500">Aucune nouvelle notification</p>
        </div>
      )}
    </div>
  );
}
