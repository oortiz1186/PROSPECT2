import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prospect = await prisma.prospect.findUnique({
    where: { id },
    include: { interactions: { orderBy: { happenedAt: "desc" } }, generatedMessages: { orderBy: { createdAt: "desc" } } },
  });
  if (!prospect) return NextResponse.json({ error: "Prospecto no encontrado" }, { status: 404 });
  return NextResponse.json(prospect);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const prospect = await prisma.prospect.update({ where: { id }, data: body });
  return NextResponse.json(prospect);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.prospect.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
