import { formatUserRole } from "@/utils/functions/functions";
import clsx from "clsx";

interface UserRoleBadgeProps {
  role: string;
  disabled?: boolean;
}

const roleStyles: Record<string, string> = {
  appOwner: "bg-red-100 text-red-800 border border-red-800",
  dev: "bg-blue-100 text-blue-800 border border-blue-800",
  superAdmin: "bg-rose-100 text-rose-800 border border-rose-800",
  admin: "bg-purple-100 text-purple-800 border border-purple-800",
  propietario: "bg-sky-100 text-sky-800 border border-sky-800",
  limpieza: "bg-green-100 text-green-800 border border-green-800",
  default: "bg-gray-200 text-gray-600 border border-gray-600",
};

export function UserRoleBadge({ role, disabled = false }: UserRoleBadgeProps) {
  const label = formatUserRole(role);
  const classes = roleStyles[role] || roleStyles.default;

  return (
    <span
      className={clsx(
        "min-w-24 xl:min-w-28 inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-medium",
        classes,
        disabled && "opacity-50"
      )}>
      {label}
    </span>
  );
}
