import { Role } from "./roles";

export interface ISidebar {
  label: string;
  getIcon: () => JSX.Element;
  link: string;
  roles: Array<Role>;
  showDivider?: boolean;
  disabled?: boolean;
}
