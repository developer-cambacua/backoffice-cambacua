"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import {
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Wrench,
  Moon,
  Sun,
  Star,
} from "lucide-react";

type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "in_progress"
  | "dark"
  | "light"
  | "special";

type Notification = { id: string; message: string; type: NotificationType };

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const alertStyles: Record<NotificationType, string> = {
    info: "bg-blue-100 border-blue-500 text-blue-500",
    success: "bg-green-100 border-green-500 text-green-700",
    warning: "bg-yellow-100 border-yellow-500 text-yellow-700",
    error: "bg-red-100 border-red-500 text-red-700",
    in_progress: "bg-orange-100 border-orange-500 text-orange-600",
    dark: "bg-gray-700 border-gray-400 text-gray-300",
    light: "bg-slate-100 border-gray-300 text-gray-700",
    special: "bg-purple-100 border-purple-500 text-purple-500",
  };

  const iconsByType: Record<NotificationType, JSX.Element> = {
    info: <Info className="w-5 h-5 shrink-0" />,
    success: <CheckCircle className="w-5 h-5 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 shrink-0" />,
    error: <XCircle className="w-5 h-5 shrink-0" />,
    in_progress: <Wrench className="w-5 h-5 shrink-0" />,
    dark: <Moon className="w-5 h-5 shrink-0" />,
    light: <Sun className="w-5 h-5 shrink-0" />,
    special: <Star className="w-5 h-5 shrink-0" />,
  };

  const pathname = usePathname();
  const hiddenRoutes = useMemo(
    () => ["/", "/reservas/carga-1", "/reservas/carga-2", "/reservas/carga-3"],
    []
  );

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("id, message, type")
      .eq("visible", true)
      .gte("expires_at", new Date().toISOString());

    if (error) console.error("Error fetching notifications:", error);
    else setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
    const channel = supabase
      .channel("realtime-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleClose = (notifId: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== notifId));
  };

  if (hiddenRoutes.includes(pathname)) return;

  if (notifications.length === 0) return null;

  return (
    <div className="grid grid-cols-12 gap-4 mb-2">
      {notifications.map((notif) => (
        <div className="col-span-12 md:col-span-8 lg:col-span-6" key={notif.id}>
          <div
            className={`border-l-8 rounded-lg py-3 px-4 ${
              alertStyles[notif.type]
            }`}>
            <div className="flex items-center justify-between gap-x-4">
              <div className="flex items-center gap-x-4">
                {iconsByType[notif.type]}
                <p className="text-sm text-inherit">{notif.message}</p>
              </div>
              <button
                onClick={() => handleClose(notif.id)}
                className="shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="currentColor"
                  className="text-inherit transition-colors">
                  <path d="M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
