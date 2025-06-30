import {
  DropdownMenu,
  DropdownMenuContent,
  // DropdownMenuItem,
  // DropdownMenuLabel,
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface IDropdownFn {
  canEnabledIt?: boolean;
  labels: string[];
  link?: string;
  onEdit: () => void;
  onStatus: () => void;
  isActive: boolean;
}

export const ActionsDropdown = ({
  canEnabledIt,
  labels,
  link,
  onEdit,
  onStatus,
  isActive,
}: IDropdownFn) => {
  const optionsClassNames: string =
    "disabled:cursor-not-allowed px-4 rounded-none disabled:text-gray-400 w-full text-start py-1 enabled:hover:bg-terciary-100 text-sm";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="hover:text-secondary-400 text-secondary-950">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 4.8C10 3.80589 10.8059 3 11.8 3C12.7941 3 13.6 3.80589 13.6 4.8C13.6 5.79411 12.7941 6.6 11.8 6.6C10.8059 6.6 10 5.79411 10 4.8ZM10 12C10 11.0059 10.8059 10.2 11.8 10.2C12.7941 10.2 13.6 11.0059 13.6 12C13.6 12.9941 12.7941 13.8 11.8 13.8C10.8059 13.8 10 12.9941 10 12ZM10 19.2C10 18.2059 10.8059 17.4 11.8 17.4C12.7941 17.4 13.6 18.2059 13.6 19.2C13.6 20.1941 12.7941 21 11.8 21C10.8059 21 10 20.1941 10 19.2Z"
            fill="currentColor"
          />
        </svg>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40 px-0 font-openSans">
        {isActive ? (
          // <Link
          //   href={link?.toString() || "/"}
          //   className="inline-block px-4 w-full text-start py-1 hover:bg-terciary-100 text-sm">
          //   {labels[0]}
          // </Link>
          <button disabled className={`${optionsClassNames}`}>
            {labels[0]}
          </button>
        ) : (
          <button disabled className={`${optionsClassNames}`}>
            {labels[0]}
          </button>
        )}
        <button
          onClick={onEdit}
          disabled={!isActive}
          className={`${optionsClassNames}`}>
          Editar
        </button>
        {canEnabledIt && (
          <button onClick={onStatus} className={`${optionsClassNames}`}>
            {isActive ? `${[labels[3]]}` : `${[labels[2]]}`}
          </button>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
