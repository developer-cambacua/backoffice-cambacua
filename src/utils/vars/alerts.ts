import { IAlert } from "@/types/alerts";

export const initialAlertState: IAlert = {
  visible: false,
  status: "info",
  msgPrinc: "",
  msgSec: "",
  code: null,
};
