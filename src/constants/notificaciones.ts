/* Tipos de notificación (columna `notifications.type`). Única fuente: schema, select y banner. */
export const NOTIFICATION_TYPES = [
  "info",
  "success",
  "warning",
  "error",
  "in_progress",
  "dark",
  "light",
  "special",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  info: "Información",
  success: "Éxito",
  warning: "Advertencia",
  error: "Error",
  in_progress: "En proceso",
  dark: "Oscura",
  light: "Clara",
  special: "Especial",
};

export const NOTIFICATION_MESSAGE_MAX = 200;
