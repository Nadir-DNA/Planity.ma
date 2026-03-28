import Link from "next/link";
import { Calendar } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <Link href="/" className="flex items-center space-x-2 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-600">
          <Calendar className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-900">{APP_NAME}</span>
      </Link>
      {children}
    </div>
  );
}
