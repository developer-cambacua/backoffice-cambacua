/**
 * Intervalos de refresco automático (React Query `refetchInterval`).
 * Reemplazan a Supabase Realtime, que requería dar acceso de lectura a la key anon.
 * Sólo sirven para ver cambios hechos por OTROS usuarios: las acciones propias ya
 * invalidan la caché y refrescan al instante. React Query no hace polling cuando
 * la pestaña está en segundo plano y vuelve a pedir los datos al volver a ella.
 */
export const POLLING_DATOS_MS = 30_000;
export const POLLING_NOTIFICACIONES_MS = 60_000;
