// Shared helpers for admin CSV routes
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth";
import Papa from "papaparse";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

export async function parseCSV<T>(req: NextRequest): Promise<{ rows: T[]; error?: string }> {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return { rows: [], error: "No se recibió archivo" };

  const text = await file.text();
  const result = Papa.parse<T>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
  });

  if (result.errors.length > 0 && result.data.length === 0) {
    return { rows: [], error: "CSV inválido: " + result.errors[0]?.message };
  }

  return { rows: result.data };
}
