import { createServerSupabase } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const formData = await req.formData();
  const file = formData.get("file") as File;

  const fileName = `documentacion-${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from("documentacion")
    .upload(fileName, file);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ fileName });
}
