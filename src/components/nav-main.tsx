"use client";

import { Collapsible } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: any;
    isActive?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    items?: {
      title: string;
      url?: string;
      disabled?: boolean;
      hidden?: boolean;
    }[];
  }[];
}) {
  const { setOpen } = useSidebar();
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items
          .filter((item) => !item.hidden)
          .map((item) => (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible">
              <SidebarMenuItem
                aria-disabled={item.disabled}
                className={
                  item.disabled ? "text-slate-200 cursor-not-allowed" : ""
                }>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  disabled={item.disabled}
                  onClick={() => setOpen(false)}>
                  {item.disabled ? (
                    <button>
                      {item.icon && <item.icon />}
                      <span className="whitespace-nowrap">{item.title}</span>
                    </button>
                  ) : (
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span className="whitespace-nowrap">{item.title}</span>
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Collapsible>
          ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
