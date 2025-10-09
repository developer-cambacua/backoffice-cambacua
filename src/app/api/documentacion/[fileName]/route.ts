import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/utils/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { fileName: string } }
) {
  console.log("soy el filename:", params.fileName);
  const supabase = await createServerSupabase();
  const bucketName = "documentacion";
  const { fileName } = params;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(fileName, 300);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ signedUrl: data?.signedUrl || null });
}
