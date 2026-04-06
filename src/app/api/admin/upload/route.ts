import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Tipo de archivo no permitido. Usa JPG, PNG o WebP." }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "El archivo supera los 5 MB" }, { status: 400 });

  const folder = (form.get("folder") as string) || "uploads";
  const ext    = file.name.split(".").pop() ?? "jpg";
  const name   = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const blob = await put(name, file, { access: "public" });

  return NextResponse.json({ url: blob.url });
}
