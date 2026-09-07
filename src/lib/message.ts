export type MessageContext = {
  businessName: string;
  contactName?: string | null;
  segment?: string | null;
  businessType?: string | null;
  offer?: string | null;
  price?: string | null;
  salesArgument?: string | null;
  website?: string | null;
  status?: string | null;
};

export type MessageType = "FIRST_CONTACT" | "FOLLOW_UP" | "WEB" | "SUPPORT" | "AUTOMATION" | "QUOTE";

export const MESSAGE_TEMPLATES: Record<MessageType, string> = {
  FIRST_CONTACT: "FIRST_CONTACT",
  FOLLOW_UP: "FOLLOW_UP",
  WEB: "WEB",
  SUPPORT: "SUPPORT",
  AUTOMATION: "AUTOMATION",
  QUOTE: "QUOTE",
};

export const DEFAULT_WHATSAPP_TEMPLATE = MESSAGE_TEMPLATES.FIRST_CONTACT;

function greeting(contactName?: string | null) {
  return contactName ? `Hola ${contactName}, buen día. 👋` : "Hola, buen día. 👋";
}

function insight(context: MessageContext) {
  if (context.salesArgument?.trim()) return context.salesArgument.trim();
  if (context.offer?.trim()) return `creo que podría haber una oportunidad para ${context.offer.trim().toLowerCase()}`;
  if (context.segment?.trim()) return `trabajo con negocios del giro ${context.segment.trim()} y normalmente hay oportunidades para mejorar procesos, presencia digital o soporte tecnológico`;
  return "creo que podría haber oportunidades para aprovechar mejor la tecnología en el negocio";
}

export function buildProspectMessage(type: MessageType, context: MessageContext) {
  const hello = greeting(context.contactName);
  const business = context.businessName;
  const detected = insight(context);
  const offer = context.offer?.trim() || "una solución tecnológica adecuada a lo que realmente necesiten";
  const price = context.price?.trim();

  switch (type) {
    case "FIRST_CONTACT":
      return `${hello}\n\nSoy Octavio Ortiz, consultor en tecnología y desarrollo de software aquí en León.\n\nEncontré ${business} y quise ponerme en contacto porque ${detected}.\n\nAyudo a negocios con páginas web, sistemas a medida, automatización y soporte TI, siempre buscando resolver una necesidad concreta y no vender tecnología por vender.\n\nTe comparto una imagen para que conozcas un poco de lo que hago. ¿Hay algo relacionado con tecnología que actualmente les gustaría mejorar o resolver?\n\nSi gustas, con mucho gusto puedo orientarte sin compromiso.`;

    case "FOLLOW_UP":
      return `${hello}\n\nSolo retomo el mensaje que te envié sobre ${business}. No quiero insistir de más; únicamente saber si actualmente tienen alguna necesidad relacionada con tecnología, sistemas, página web, automatización o soporte TI.\n\nSi hay algo que les quite tiempo o les esté generando problemas, puedo revisarlo contigo y decirte qué opciones tendrían, sin compromiso.`;

    case "WEB":
      return `${hello}\n\nEstuve revisando ${business} y quería proponerte algo puntual: mejorar la forma en que el negocio se presenta y recibe contactos por internet.\n\nPuedo ayudarte con una página o landing moderna, adaptable a celular y conectada a WhatsApp, ubicación y formularios, enfocada en facilitar que un cliente encuentre el negocio y se comunique.\n\nSi te interesa, puedo prepararte una propuesta sencilla para que veas alcance, tiempo y costo, sin compromiso.`;

    case "SUPPORT":
      return `${hello}\n\nTrabajo apoyando negocios como ${business} cuando necesitan resolver temas de computadoras, red, respaldos, servidores o problemas de TI sin tener que contratar un departamento interno.\n\nLa idea es que tengan un contacto confiable cuando algo falle o requieran mantenimiento. Si actualmente tienen algún problema o algo que quieran prevenir, puedo revisarlo contigo y orientarte.`;

    case "AUTOMATION":
      return `${hello}\n\nEn negocios como ${business} muchas veces hay tareas que se repiten todos los días y consumen tiempo: seguimiento de clientes, reportes, formularios, inventarios, avisos o atención por WhatsApp.\n\nPuedo ayudarte a detectar uno de esos procesos y revisar si conviene automatizarlo con una solución sencilla. Si me cuentas qué tarea les quita más tiempo, te digo qué podría hacerse.`;

    case "QUOTE":
      return `${hello}\n\nTe escribo para dar seguimiento a la propuesta de ${offer} para ${business}${price ? `, con una inversión estimada de ${price}` : ""}.\n\nSi tienes alguna duda sobre alcance, tiempos o forma de trabajo, con gusto la revisamos. Si te parece, también podemos definir el siguiente paso para comenzar.`;
  }
}

export function renderTemplate(template: string, context: MessageContext) {
  if (Object.values(MESSAGE_TEMPLATES).includes(template as MessageType)) {
    return buildProspectMessage(template as MessageType, context);
  }

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
