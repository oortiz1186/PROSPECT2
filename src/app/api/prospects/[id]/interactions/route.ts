import { NextResponse } from "next/server";
import { ContactChannel } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const summary = String(body.summary || "").trim();
  const channel = (body.channel || "WHATSAPP") as ContactChannel;

  if (!summary) return NextResponse.json({ error: "Escribe un resumen del contacto." }, { status: 400 });

  const interaction = await prisma.interaction.create({
    data: { prospectId: id, channel, summary },
  });

  await prisma.prospect.update({
    where: { id },
    data: { lastContactAt: new Date() },
  });

  return NextResponse.json(interaction, { status: 201 });
}
