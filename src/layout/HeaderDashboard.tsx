import Link from "next/link";
import Logo from "@/assets/img/icons/header/logo.png";
import { SidebarTrigger } from "@/components/ui/sidebar";
export default function DashboardHeader() {

  return (
    <header className="sticky top-0 bg-white box-shadow-2 z-[40] md:z-[1000]">
      <div className="relative">
        <div className={`max-w-[95%] w-full mx-auto py-2 px-6`}>
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-x-2 md:gap-0">
              <SidebarTrigger className="md:hidden"/>
              <Link href={"/"}>
                <img
                  src={Logo.src}
                  alt="Logo de Cambacua"
                  className="w-auto h-[56px] shrink-0"
                />
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
