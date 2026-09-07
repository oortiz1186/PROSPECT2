import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_WHATSAPP_TEMPLATE, MESSAGE_TEMPLATES, MessageType, renderTemplate, buildWhatsAppUrl } from "@/lib/message";

export async function POST(request: Request) {
  const { prospectId, template, messageType } = await request.json();
  if (!prospectId) return NextResponse.json({ error: "prospectId requerido" }, { status: 400 });

  const prospect = await prisma.prospect.findUnique({ where: { id: prospectId } });
  if (!prospect) return NextResponse.json({ error: "Prospecto no encontrado" }, { status: 404 });

  const selectedTemplate = template || MESSAGE_TEMPLATES[(messageType as MessageType) || "FIRST_CONTACT"] || DEFAULT_WHATSAPP_TEMPLATE;
  const body = renderTemplate(selectedTemplate, {
    businessName: prospect.name,
    contactName: prospect.contactName,
    segment: prospect.segment,
    offer: prospect.suggestedOffer,
    price: prospect.suggestedPrice,
  });

  const saved = await prisma.generatedMessage.create({
    data: {
      prospectId: prospect.id,
      channel: "WHATSAPP",
      body,
    },
  });

  return NextResponse.json({ message: body, whatsappUrl: buildWhatsAppUrl(prospect.whatsapp || prospect.phone, body), id: saved.id });
}
