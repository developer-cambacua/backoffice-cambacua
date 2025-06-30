import Link from "next/link";

import Logo from "@/assets/img/icons/header/logo.png";
import Instagram from "@/assets/img/icons/footer/instagram.svg";
import WhatsApp from "@/assets/img/icons/footer/whatsapp.svg";
import Maps from "@/assets/img/icons/footer/map.svg";

import { Container } from "@/components/container/Container";

export default function Footer() {
  const date = new Date().getFullYear();
  return (
    <footer className="bg-white border-t-2 border-terciary-200 shadow-xl">
      <Container className={`container mx-auto p-6`}>
        <div className="flex flex-wrap md:items-center justify-between gap-x-4 gap-y-6">
          <div className="flex items-center justify-between md:justify-start gap-x-8">
            <img src={Logo.src} alt="Logo de Cambacua" className="h-[72px]" />
            <div className="flex items-center gap-x-4 shrink-0">
              <Link
                href={"https://www.instagram.com/cambacua.ba/"}
                className="p-1">
                <img src={Instagram.src} alt="" className="size-7" />
              </Link>
              <Link
                href={"https://goo.gl/maps/ab3ruPJK1LZxQ8caA"}
                className="p-1">
                <img src={Maps.src} alt="" className="size-7" />
              </Link>
              <Link href={"https://wa.link/8d91nf"} className="p-1">
                <img src={WhatsApp.src} alt="" className="size-7" />
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-y-2">
            <p className="text-primary-500 text-sm">
              © Copyright Cambacuá {date}. Todos los derechos reservados.
            </p>
            <p className="text-primary-500 text-sm">
              Sitio web desarrollado por Damian Laterza.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
