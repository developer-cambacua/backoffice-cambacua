export interface IAlert {
  visible: boolean;
  status: "info" | "success" | "warning" | "error";
  msgPrinc: string;
  msgSec?: string;
  fullWidth?: boolean;
  code?: number | null;
}
