"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useNotificaciones } from "@/hooks/useNotificaciones";
import { toast } from "sonner";
import { Toast } from "../toast/Toast";
import type { NotificationType } from "@/constants/notificaciones";
import { alertStyles, iconsByType } from "./notificationStyles";

export type Notification = {
  id: string;
  message: string;
  type: NotificationType;
};

// interface NotificationsProps {
//   initialData: Notification[];
// }

const Notifications = () => {
  const [hiddenNotifications, setHiddenNotifications] = useState<Set<string>>(
    new Set()
  );
  const {
    data: NotificationsData = [],
    error,
    isLoading,
  } = useNotificaciones();

  const pathname = usePathname();
  const hiddenRoutes = useMemo(
    () => ["/", "/reservas/carga-1", "/reservas/carga-2", "/reservas/carga-3"],
    []
  );

  const visibleNotifications = NotificationsData.filter(
    (notification: Notification) => !hiddenNotifications.has(notification.id)
  );

  const handleClose = (notifId: string) => {
    setHiddenNotifications((prev) => new Set([...prev, notifId]));
  };

  useEffect(() => {
    if (error) {
      toast.custom(
        (id) => (
          <Toast id={id} variant="error">
            <div>
              <p>Ha ocurrido un error: {error.message}</p>
            </div>
          </Toast>
        ),
        { duration: 5000 }
      );
    }
  }, [error]);

  if (hiddenRoutes.includes(pathname)) return;
  if (isLoading) return null;
  if (visibleNotifications.length === 0) return null;

  return (
    <div className="grid grid-cols-12 gap-4 mb-2">
      {visibleNotifications.map((notif: Notification) => (
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
                className="shrink-0"
                aria-label="Ocultar alerta">
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
