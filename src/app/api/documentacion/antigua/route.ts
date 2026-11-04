import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { renameFile } from "@/utils/functions/functions";

export const dynamic = "force-dynamic";

const BUCKET = "documentacion";
const MESES_ANTIGUEDAD = 6;
const PAGE_SIZE = 1000;

interface ArchivoAntiguo {
  name: string;
  created_at: string;
  size: number;
}

const fechaCorte = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - MESES_ANTIGUEDAD);
  return d;
};

/* Lista (paginando) los archivos del bucket con más de 6 meses desde su subida. */
async function listarAntiguos(): Promise<ArchivoAntiguo[]> {
  const corte = fechaCorte();
  const resultado: ArchivoAntiguo[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .list("", {
        limit: PAGE_SIZE,
        offset,
        sortBy: { column: "created_at", order: "asc" },
      });

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;

    for (const f of data) {
      /* Las carpetas no tienen id/metadata; los archivos están en la raíz */
      if (!f.id || !f.created_at) continue;
      if (new Date(f.created_at) < corte) {
        resultado.push({
          name: f.name,
          created_at: f.created_at,
          size: Number(f.metadata?.size ?? 0),
        });
      }
    }

    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return resultado;
}

export async function GET() {
  try {
    const archivos = await listarAntiguos();
    const totalBytes = archivos.reduce((acc, a) => acc + a.size, 0);
    return NextResponse.json({
      archivos,
      totalBytes,
      cantidad: archivos.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Error al listar la documentación" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const nombres: unknown = body?.nombres;

    if (
      !Array.isArray(nombres) ||
      nombres.length === 0 ||
      nombres.some((n) => typeof n !== "string")
    ) {
      return NextResponse.json(
        { error: "Debés indicar los archivos a eliminar" },
        { status: 400 }
      );
    }

    /* Revalidar en el servidor: sólo se borran los que realmente tienen +6 meses */
    const antiguos = await listarAntiguos();
    const permitidos = new Set(antiguos.map((a) => a.name));
    const aEliminar = (nombres as string[]).filter((n) => permitidos.has(n));
    const omitidos = nombres.length - aEliminar.length;

    if (aEliminar.length === 0) {
      return NextResponse.json({ eliminados: 0, omitidos });
    }

    /* 1) Limpiar la referencia en reservas (nombre original y renombrado) */
    const referencias = Array.from(
      new Set([...aEliminar, ...aEliminar.map((n) => renameFile(n))])
    );
    const { error: updError } = await supabaseAdmin
      .from("reservas")
      .update({ documentacion_huesped: null })
      .in("documentacion_huesped", referencias);

    if (updError) {
      return NextResponse.json({ error: updError.message }, { status: 500 });
    }

    /* 2) Borrar los objetos del bucket */
    const { error: rmError } = await supabaseAdmin.storage
      .from(BUCKET)
      .remove(aEliminar);

    if (rmError) {
      return NextResponse.json({ error: rmError.message }, { status: 500 });
    }

    return NextResponse.json({ eliminados: aEliminar.length, omitidos });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "Error al eliminar la documentación" },
      { status: 500 }
    );
  }
}
