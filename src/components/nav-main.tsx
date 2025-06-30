"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url?: string;
    icon: LucideIcon | any;
    isActive?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    items?: {
      title: string;
      url: string;
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
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    disabled={item.disabled}
                    onClick={() => setOpen(true)}>
                    {item.icon && <item.icon />}
                    <span className="whitespace-nowrap">{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items
                      ?.filter((subItem) => !subItem.hidden)
                      .map((subItem) => (
                        <SidebarMenuSubItem
                          key={subItem.title}
                          aria-disabled={subItem.disabled}
                          className={
                            subItem.disabled
                              ? "text-slate-200 cursor-not-allowed"
                              : ""
                          }>
                          <SidebarMenuSubButton asChild>
                            <Link
                              onClick={() => setOpen(false)}
                              href={subItem.url}
                              tabIndex={subItem.disabled ? -1 : 0}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
