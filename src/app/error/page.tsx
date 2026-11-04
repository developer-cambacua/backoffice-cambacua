import Link from "next/link";

/* Destino del middleware cuando ocurre un error inesperado (ej. Supabase no responde) */
export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8 lg:py-24">
      <div className="flex flex-col gap-4 max-w-xl">
        <h1 className="font-semibold text-3xl lg:text-4xl">
          Ocurrió un error inesperado
        </h1>
        <p className="text-lg 2xl:text-xl">
          No pudimos verificar tu acceso en este momento. Probá de nuevo en
          unos minutos.
        </p>
        <Link
          href={"/"}
          role="button"
          className="w-fit bg-secondary-900 text-white lg:text-lg font-bold py-2 px-6 rounded-lg hover:bg-secondary-600">
          Reintentar
        </Link>
      </div>
    </div>
  );
}
