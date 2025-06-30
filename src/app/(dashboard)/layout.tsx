import { AppSidebar } from "@/components/app-sidebar";
import Notifications from "@/components/notifications/Notifications";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from "@/layout/HeaderDashboard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="[--header-height:calc(theme(spacing.16))]">
        <SidebarProvider className="flex flex-col" defaultOpen={false}>
          <div className="flex flex-1">
            <AppSidebar collapsible="icon"/>
            <SidebarInset className="bg-inherit">
              <DashboardHeader />
              <main className="max-w-[95%] w-full mx-auto p-6 min-h-full">
                <Notifications />
                {children}
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </>
  );
}
