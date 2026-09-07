export type MessageContext = {
  businessName: string;
  contactName?: string | null;
  segment?: string | null;
  offer?: string | null;
  price?: string | null;
};

export function renderTemplate(template: string, context: MessageContext) {
  return template
    .replaceAll("{{negocio}}", context.businessName)
    .replaceAll("{{contacto}}", context.contactName || "")
    .replaceAll("{{segmento}}", context.segment || "")
    .replaceAll("{{oferta}}", context.offer || "servicios de TI y desarrollo")
    .replaceAll("{{precio}}", context.price || "");
}

export const DEFAULT_WHATSAPP_TEMPLATE =
  "Hola{{contacto}}, vi {{negocio}} y me gustaría proponerte una mejora concreta: {{oferta}}. La idea es ayudarte a ahorrar tiempo, mejorar la atención a tus clientes o resolver necesidades tecnológicas sin contratar un área de TI completa. Si te interesa, te comparto una propuesta breve y sin compromiso.";

export function buildWhatsAppUrl(phone: string | null | undefined, message: string) {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return null;
  const normalized = digits.length === 10 ? `52${digits}` : digits;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
