"use client";

import React from "react";
import { toast } from "sonner";

import { CheckCircle, XCircle, Info, AlertTriangle, XIcon } from "lucide-react";
import { ReactNode } from "react";

export type ToastVariant = "success" | "error" | "info" | "warning";

interface ToastProps {
  id: string | number;
  variant?: ToastVariant;
  children: ReactNode;
  className?: string;
}

const iconMap = {
  success: <CheckCircle className="text-green-600" size={20} />,
  error: <XCircle className="text-red-600" size={20} />,
  info: <Info className="text-blue-500" size={20} />,
  warning: <AlertTriangle className="text-yellow-600" size={20} />,
};

export function Toast({
  id,
  variant = "info",
  children,
  className,
}: React.PropsWithChildren<ToastProps>) {
  return (
    <div className="relative flex items-center justify-between gap-2 bg-white shadow-lg rounded-lg w-full md:max-w-[364px] p-4 outline outline-1 outline-gray-200">
      <div className="font-openSans text-secondary-950 flex items-center gap-3">
        <span className="self-baseline mt-1">{iconMap[variant]}</span>
        {children}
      </div>
      <button
        onClick={() => toast.dismiss(id)}
        className="hover:text-gray-600 dark:hover:text-gray-300 self-baseline text-gray-400">
        <XIcon size={20} className="mt-0.5" />
      </button>
    </div>
  );
}
