export type ServerResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
