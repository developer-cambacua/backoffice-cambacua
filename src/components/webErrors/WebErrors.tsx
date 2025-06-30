import Image from "next/image";
import Link from "next/link";
import MainImage from "@/assets/img/icons/web-errors/403/access-denied.svg";
import notFound from "@/assets/img/icons/web-errors/404/not-found.svg";

export const WebErrors = ({ code }: { code: Number }) => {
  if (code === 401) {
    return (
      <div className="container mx-auto px-4 py-8 lg:py-24">
        <div className="grid grid-cols-12 h-full gap-6">
          <div className="col-span-6 justify-self-center md:justify-self-start self-center">
            <div className="flex flex-col">
              <h1 className="font-semibold text-3xl lg:text-4xl">
                Acceso denegado
              </h1>
              <div className="my-4 pb-3">
                <p className="text-lg 2xl:text-xl">
                  No estas autorizado para acceder al sistema.
                </p>
              </div>
              <Link
                href={"/"}
                role="button"
                className="w-fit bg-azul-600 text-white lg:text-lg font-bold py-2 px-6 rounded-lg hover:bg-azul-700">
                Inicio
              </Link>
            </div>
          </div>
          <div className="col-span-6">
            <div className="self-center justify-self-center lg:justify-self-end">
              <Image src={MainImage} alt="" />
            </div>
          </div>
        </div>
      </div>
    );
  } else if (code === 403) {
    return (
      <div className="container mx-auto px-4 py-8 lg:py-24">
        <div className="grid grid-cols-12 h-full gap-6">
          <div className="col-span-6 justify-self-center md:justify-self-start self-center">
            <div className="flex flex-col">
              <h1 className="font-semibold text-3xl lg:text-4xl">
                Acceso denegado
              </h1>
              <div className="my-4 pb-3">
                <p className="text-lg 2xl:text-xl">
                  No estas autorizado para visualizar esta sección.
                </p>
              </div>
              <Link
                href={"/"}
                role="button"
                className="w-fit bg-olide-500/90 hover:bg-olide-500 text-white lg:text-lg py-2 px-6 rounded-lg hover:bg-azul-700">
                Inicio
              </Link>
            </div>
          </div>
          <div className="col-span-6">
            <div className="self-center justify-self-center lg:justify-self-end">
              <Image src={MainImage} alt="" />
            </div>
          </div>
        </div>
      </div>
    );
  } else if (code === 404) {
    return (
      <div className="container mx-auto px-4 py-8 lg:py-24">
        <div className="grid grid-cols-12 h-full gap-6">
          <div className="col-span-6 justify-self-center md:justify-self-start self-center">
            <div className="flex flex-col">
              <h1 className="font-medium text-3xl lg:text-4xl mb-6">
                Página no encontrada
              </h1>
              {
                <Link
                  href={"/"}
                  role="button"
                  className="w-fit bg-secondary-900 text-white lg:text-lg font-bold py-2 px-6 rounded-lg hover:bg-secondary-600">
                  Inicio
                </Link>
              }
            </div>
          </div>
          <div className="col-span-6">
            <div className="self-center justify-self-center lg:justify-self-end">
              <Image src={notFound} alt="" />
            </div>
          </div>
        </div>
      </div>
    );
  }
};
