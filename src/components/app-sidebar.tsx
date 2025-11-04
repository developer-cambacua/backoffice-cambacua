"use client";

import { NavMain } from "@/components/nav-main";
// import { NavProjects } from "@/components/nav-projects";
// import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { sidebarData } from "@/constants/sidebarOptions";
import { useUserStore } from "@/stores/useUserStore";
import { Skeleton } from "@/components/ui/skeleton";
import { rolesMap } from "@/utils/objects/routes";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // top-[--header-height] !h-[calc(100svh-var(--header-height))]
  const user = useUserStore((state) => state.user);
  const sidebarDataUser = useUserStore((state) => state.user);
  const { toggleSidebar } = useSidebar();

  const filteredNavMain = user
    ? sidebarData.navMain.filter((item) => {
        const allowedRoles = rolesMap[item.url];
        return allowedRoles?.includes(user.rol);
      })
    : [];

  return (
    <Sidebar className="!h-[calc(100svh)]" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="cambacua"
              asChild
              variant={"cambacua"}
              onClick={toggleSidebar}>
              <div>
                <div className="flex size-8 items-center justify-center rounded-full bg-transparent hover:bg-terciary-100 transition-all hover:text-secondary-900">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M4 12h16" />
                    <path d="M4 18h16" />
                    <path d="M4 6h16" />
                  </svg>
                </div>
                {/* <div className="grid flex-1 text-left text-sm">
                  <span className="truncate font-semibold">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div> */}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        {/* <NavProjects projects={sidebarData.projects} /> */}
        {/* <NavSecondary items={sidebarData.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        {sidebarDataUser ? (
          <NavUser user={sidebarDataUser} />
        ) : (
          <Skeleton className="h-8 w-8 min-h-8 min-w-8 rounded-lg" />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
