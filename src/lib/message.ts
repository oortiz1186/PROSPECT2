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
  return contactName ? `Hola ${contactName}, buen día.` : "Hola, buen día.";
}

function cleanText(value?: string | null) {
  return (value || "")
    .replace(/\s+/g, " ")
    .replace(/[.。]+$/, "")
    .trim();
}

function lowerFirst(value: string) {
  if (!value) return value;
  return value.charAt(0).toLocaleLowerCase("es-MX") + value.slice(1);
}

function looksLikeActionPhrase(value: string) {
  return /^(facilitar|mejorar|automatizar|optimizar|reducir|agilizar|centralizar|integrar|crear|desarrollar|implementar|aumentar|fortalecer|organizar|digitalizar|simplificar|captar|generar|mostrar|permitir|conectar|dar|ofrecer|ayudar)\b/i.test(value);
}

function naturalizeInsight(context: MessageContext) {
  const rawArgument = cleanText(context.salesArgument);
  if (rawArgument) {
    const normalized = lowerFirst(rawArgument);
    if (looksLikeActionPhrase(rawArgument)) {
      return `Vi una oportunidad para ${normalized}.`;
    }
    if (/^(falta|no tiene|no cuenta|carece|necesita|requiere|puede|podría|hay)\b/i.test(rawArgument)) {
      return `Al revisar un poco el negocio, noté que ${normalized}.`;
    }
    return `Al revisar un poco ${context.businessName}, vi un punto que podría valer la pena mejorar: ${normalized}.`;
  }

  const offer = cleanText(context.offer);
  if (offer) {
    return `Vi una oportunidad para ayudarles con ${lowerFirst(offer)}.`;
  }

  const segment = cleanText(context.segment);
  if (segment) {
    return `Por el giro de ${lowerFirst(segment)}, creo que puede haber oportunidades para facilitar la atención a clientes, mejorar su presencia digital o simplificar tareas del día a día.`;
  }

  return "Vi una oportunidad para que la tecnología les ayude a simplificar tareas, atender mejor a sus clientes o mejorar su presencia digital.";
}

function contextualQuestion(context: MessageContext) {
  const text = `${cleanText(context.salesArgument)} ${cleanText(context.offer)} ${cleanText(context.segment)}`.toLocaleLowerCase("es-MX");

  if (/(pedido|reserv|cita|cliente|whatsapp|atenci[oó]n)/.test(text)) {
    return "¿Actualmente hay algo relacionado con pedidos, atención a clientes o WhatsApp que les gustaría mejorar?";
  }
  if (/(web|p[aá]gina|internet|digital|redes|seo|ubicaci[oó]n|horario|promoci[oó]n)/.test(text)) {
    return "¿Actualmente hay algo de su presencia en internet o de la forma en que los clientes los encuentran y contactan que les gustaría mejorar?";
  }
  if (/(automat|proceso|reporte|inventario|seguimiento|manual)/.test(text)) {
    return "¿Hay alguna tarea o proceso que hoy les quite tiempo y que les gustaría hacer más sencillo?";
  }
  if (/(soporte|computadora|red|servidor|respaldo|sistema)/.test(text)) {
    return "¿Actualmente tienen alguna necesidad de soporte, sistemas o infraestructura que les gustaría resolver o prevenir?";
  }

  return "¿Actualmente hay algo relacionado con tecnología que les gustaría mejorar o resolver?";
}

export function buildProspectMessage(type: MessageType, context: MessageContext) {
  const hello = greeting(context.contactName);
  const business = cleanText(context.businessName) || "su negocio";
  const insight = naturalizeInsight(context);
  const question = contextualQuestion(context);
  const offer = cleanText(context.offer) || "una solución tecnológica adecuada a lo que realmente necesiten";
  const price = cleanText(context.price);

  switch (type) {
    case "FIRST_CONTACT":
      return `${hello}\n\nSoy Octavio Ortiz, consultor en tecnología y desarrollo de software aquí en León.\n\nEncontré ${business} y estuve revisando un poco el negocio. ${insight}\n\nMe dedico a ayudar negocios a aprovechar mejor la tecnología con soluciones prácticas y pensadas para una necesidad concreta. Puede ser desde mejorar su presencia digital hasta simplificar procesos, facilitar la atención por WhatsApp o resolver temas de soporte TI.\n\nTe comparto una imagen para que conozcas un poco de lo que hago.\n\n${question}\n\nSi gustas, puedo revisar su caso y darte algunas ideas sin compromiso.\n\nOctavio Ortiz\nConsultor TI & Desarrollo de Software`;

    case "FOLLOW_UP":
      return `${hello}\n\nSolo retomo el mensaje que te envié sobre ${business}. No quiero insistir de más; quería saber si alcanzaste a revisarlo.\n\n${question}\n\nSi hay algo que quieran mejorar, puedo darte una opinión inicial y algunas opciones sin compromiso.`;

    case "WEB":
      return `${hello}\n\nEstuve revisando ${business} y quería proponerte algo puntual: facilitar que sus clientes encuentren rápidamente información útil como servicios, ubicación, horarios, promociones y una forma sencilla de contactarlos o escribirles por WhatsApp.\n\nPuedo ayudarte con una página o landing moderna, adaptable a celular y pensada para convertir visitas en contactos reales.\n\nSi te interesa, puedo revisar su caso y prepararte una propuesta sencilla con alcance, tiempo y costo, sin compromiso.`;

    case "SUPPORT":
      return `${hello}\n\nTrabajo apoyando negocios como ${business} cuando necesitan resolver temas de computadoras, red, respaldos, servidores o problemas de TI sin tener que contratar un departamento interno.\n\nLa idea es que tengan un contacto confiable cuando algo falle o requieran mantenimiento. Si actualmente tienen algún problema o algo que quieran prevenir, puedo revisarlo contigo y orientarte.`;

    case "AUTOMATION":
      return `${hello}\n\nEn negocios como ${business} muchas veces hay tareas que se repiten todos los días y consumen tiempo: seguimiento de clientes, reportes, formularios, inventarios, avisos o atención por WhatsApp.\n\nPuedo ayudarte a detectar uno de esos procesos y revisar si conviene automatizarlo con una solución sencilla. Si me cuentas qué tarea les quita más tiempo, te digo qué podría hacerse.`;

    case "QUOTE":
      return `${hello}\n\nTe escribo para dar seguimiento a la propuesta de ${lowerFirst(offer)} para ${business}${price ? `, con una inversión estimada de ${price}` : ""}.\n\nSi tienes alguna duda sobre alcance, tiempos o forma de trabajo, con gusto la revisamos. Si te parece, también podemos definir el siguiente paso para comenzar.`;
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
