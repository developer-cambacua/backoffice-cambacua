"use client"

import { Container } from "@/components/container/Container";
import Image from "next/image";

import UnderConstr from "@/assets/img/icons/web-errors/under-construction/site-under-construction.svg";
import { Button } from "@/components/buttons/Button";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <Container>
      <div className="grid grid-cols-12 gap-6 p-12">
        <div className="col-span-6 self-center space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Pagina en construcción</h1>
            <p className="text-lg">Estamos trabajando en esta sección.</p>
          </div>
          <Button
            color="primary"
            width="responsive"
            onClick={() => router.back()}>
            Volver
          </Button>
        </div>
        <div className="col-span-6">
          <Image src={UnderConstr} alt="" className="w-full" />
        </div>
      </div>
    </Container>
  );
}
