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
          <img src={Logo.src} alt="Logo de Cambacua" className="h-[72px]" />
          <div className="flex flex-col gap-y-2">
            <p className="text-primary-500 text-sm">
              © Copyright Cambacuá {date}. Todos los derechos reservados.
            </p>
            <p className="text-primary-500 text-sm">
              Para consultar la política de privacidad y los términos de uso,
              hacé clic{" "}
              <span>
                <Link
                  href="/politica-de-privacidad"
                  className="text-primary-500 text-sm hover:underline inline-block">
                  acá
                </Link>
              </span>
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
