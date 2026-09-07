import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

function text(v: unknown) {
  return v == null ? "" : String(v).trim();
}

function detectSize(range: string) {
  if (range.includes("0 a 5") || range.includes("6 a 10")) return "MICRO" as const;
  if (range.includes("11") || range.includes("31") || range.includes("51")) return "SMALL" as const;
  if (range.includes("101") || range.includes("251")) return "MEDIUM" as const;
  return "UNKNOWN" as const;
}

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file") as File | null;
  const dataset = text(form.get("dataset"));
  if (!file) return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const wb = XLSX.read(bytes, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

  let imported = 0;
  for (const row of rows) {
    const name = text(row.Empresa || row.Negocio || row.nombre || row.Name);
    if (!name) continue;
    const employeeRange = text(row["Tamaño DENUE"] || row.Tamaño || row["Tamaño"] || row.employeeRange);
    const score = Number(row.Score || 0) || 0;
    const phone = text(row.Teléfono || row.Telefono || row.phone);
    const sourceUrl = text(row["URL fuente"] || row.Fuente || row.sourceUrl);

    await prisma.prospect.create({
      data: {
        name,
        segment: text(row.Segmento || row.Giro || row.segment) || null,
        businessType: dataset || null,
        size: detectSize(employeeRange),
        employeeRange: employeeRange || null,
        address: text(row.Dirección || row.Ubicación || row.Direccion || row.address) || null,
        neighborhood: text(row.Colonia || row.neighborhood) || null,
        postalCode: text(row.CP || row.postalCode) || null,
        phone: phone || null,
        suggestedOffer: text(row["Qué ofrecer"] || row["Oferta sugerida"] || row.offer) || null,
        suggestedPrice: text(row["Precio sugerido"] || row.price) || null,
        salesArgument: text(row.Argumento || row["Argumento de venta"] || row.salesArgument) || null,
        initialMessage: text(row["Mensaje inicial"] || row.initialMessage) || null,
        score,
        priority: text(row.Prioridad || row.priority) || "C",
        source: "Importación Excel",
        sourceUrl: sourceUrl || null,
        notes: dataset ? `Dataset: ${dataset}` : null,
      },
    });
    imported++;
  }

  return NextResponse.json({ imported });
}
