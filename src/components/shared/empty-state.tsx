import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Icon className="h-12 w-12 text-black mb-4" strokeWidth={1.5} />
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-6 inline-flex items-center justify-center rounded-md border border-[rgba(198,198,198,0.4)] bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-[#f9f9f9] transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}