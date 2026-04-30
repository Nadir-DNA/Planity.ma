
"use client";

import { toast, Toaster } from "react-hot-toast";

export function ToastProvider() {
  return <Toaster position="top-center" toastOptions={{ duration: 4000, style: { borderRadius: "12px", padding: "16px" } }} />;
}

export const showToast = {
  success: (msg: string) => toast.success(msg),
  error: (msg: string) => toast.error(msg),
  loading: (msg: string) => toast.loading(msg),
  dismiss: (id: string) => toast.dismiss(id),
};
