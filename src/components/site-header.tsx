"use client";

import { Menu } from "lucide-react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";

import Logo from "@/assets/img/icons/header/logo.png";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex sticky top-0 z-50 w-full items-center border-b bg-background">
      <div className="flex h-[--header-height] w-full items-center gap-2 px-2 py-2">
        <Button
          className="size-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}>
          <Menu />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Link href={"/"}>
          <img
            src={Logo.src}
            alt="Logo de Cambacua"
            className="w-auto h-[48px] shrink-0"
          />
        </Link>
      </div>
    </header>
  );
}
