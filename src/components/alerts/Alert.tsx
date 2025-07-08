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

type Notification = { message: string; type: NotificationType };
export const Alert = ({ type, message }: Notification) => {
  return (
    <div className="col-span-12 md:col-span-8 lg:col-span-6">
      <div className={`border-l-8 rounded-lg py-3 px-4 ${alertStyles[type]}`}>
        <div className="flex items-center justify-between gap-x-4">
          <div className="flex items-center gap-x-4">
            <span>{iconsByType[type]}</span>
            <p className="text-sm text-inherit">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
