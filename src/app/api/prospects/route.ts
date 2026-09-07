import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProspectSize, ProspectStatus } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status") as ProspectStatus | null;
  const size = searchParams.get("size") as ProspectSize | null;
  const priority = searchParams.get("priority")?.trim();

  const prospects = await prisma.prospect.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { segment: { contains: q, mode: "insensitive" } },
              { neighborhood: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(status ? { status } : {}),
      ...(size ? { size } : {}),
      ...(priority ? { priority } : {}),
    },
    orderBy: [{ priority: "asc" }, { score: "desc" }, { name: "asc" }],
    take: 500,
  });

  return NextResponse.json(prospects);
}

export async function POST(request: Request) {
  const body = await request.json();
  const prospect = await prisma.prospect.create({ data: body });
  return NextResponse.json(prospect, { status: 201 });
}
