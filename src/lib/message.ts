export type MessageContext = {
  businessName: string;
  contactName?: string | null;
  segment?: string | null;
  offer?: string | null;
  price?: string | null;
};

export type MessageType = "FIRST_CONTACT" | "FOLLOW_UP" | "WEB" | "SUPPORT" | "AUTOMATION" | "QUOTE";

export const MESSAGE_TEMPLATES: Record<MessageType, string> = {
  FIRST_CONTACT: "Hola{{contacto}}, vi {{negocio}} y me gustaría proponerte una mejora concreta: {{oferta}}. La idea es ayudarte a ahorrar tiempo, mejorar la atención a tus clientes o resolver necesidades tecnológicas sin contratar un área de TI completa. Si te interesa, te comparto una propuesta breve y sin compromiso.",
  FOLLOW_UP: "Hola{{contacto}}, retomo el mensaje sobre {{negocio}}. Quería saber si te interesa que te comparta una propuesta breve para {{oferta}}. Puedo plantearte algo sencillo, enfocado en resolver una necesidad puntual y sin compromiso.",
  WEB: "Hola{{contacto}}, estuve revisando {{negocio}} y veo una oportunidad para mejorar su presencia digital y facilitar que más clientes los contacten. Puedo ayudarles con una página o landing sencilla conectada a WhatsApp, pensada para mostrar servicios, ubicación y generar contactos. Si te interesa, te comparto una propuesta breve.",
  SUPPORT: "Hola{{contacto}}, apoyo a negocios como {{negocio}} con soporte de computadoras, red, respaldos y solución de problemas de TI. La idea es que tengan a quién recurrir cuando algo falle sin necesidad de contratar un área interna. Si te interesa, te explico cómo trabajo y costos.",
  AUTOMATION: "Hola{{contacto}}, vi {{negocio}} y creo que puede haber procesos que hoy se hacen manualmente y se podrían simplificar con una automatización pequeña: seguimiento de clientes, reportes, inventario, formularios o WhatsApp. Si te interesa, revisamos un proceso puntual y te digo qué se puede automatizar.",
  QUOTE: "Hola{{contacto}}, te comparto seguimiento de la propuesta para {{negocio}} sobre {{oferta}}{{precio}}. Si te parece, puedo resolver dudas y definir el siguiente paso para comenzar.",
};

export const DEFAULT_WHATSAPP_TEMPLATE = MESSAGE_TEMPLATES.FIRST_CONTACT;

export function renderTemplate(template: string, context: MessageContext) {
  const contact = context.contactName ? ` ${context.contactName}` : "";
  const price = context.price ? ` con una inversión estimada de ${context.price}` : "";
  return template
    .replaceAll("{{negocio}}", context.businessName)
    .replaceAll("{{contacto}}", contact)
    .replaceAll("{{segmento}}", context.segment || "")
    .replaceAll("{{oferta}}", context.offer || "servicios de TI y desarrollo")
    .replaceAll("{{precio}}", price);
}

export function buildWhatsAppUrl(phone: string | null | undefined, message: string) {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return null;
  const normalized = digits.length === 10 ? `52${digits}` : digits;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
