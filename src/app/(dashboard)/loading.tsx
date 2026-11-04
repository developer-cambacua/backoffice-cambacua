import { Spinner } from "@/components/spinner/Spinner";

/**
 * Spinner para TODAS las rutas del dashboard. Va dentro de (dashboard) para quedar
 * debajo de su layout (sidebar + header): al navegar entre secciones el layout se
 * mantiene y este loading se muestra en el área de contenido.
 * (`app/loading.tsx` queda por encima del layout y sólo aparece en la carga inicial.)
 */
export default function Loading() {
  return <Spinner />;
}
