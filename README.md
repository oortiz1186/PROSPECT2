# PROSPECT2

CRM ligero de prospección para administrar empresas pequeñas y medianas, completar datos faltantes, dar seguimiento comercial y generar mensajes reutilizables.

## Stack
- Next.js + TypeScript
- PostgreSQL 16
- Prisma ORM
- CSS responsive
- Importación XLSX/CSV

## Funciones del MVP
- Importar los dos Excel de prospectos (pequeñas y medianas empresas)
- Clasificar prospectos por dataset, segmento, tamaño, prioridad y estado
- Editar teléfono, WhatsApp, correo, web, oferta y precio desde el panel
- Buscar por empresa, giro, colonia, teléfono o correo
- Guardar estado comercial: pendiente, investigado, contactado, respondió, interesado, cotizado, ganado, perdido o descartado
- Generar un mensaje comercial usando los datos del prospecto
- Abrir WhatsApp Web con el mensaje ya preparado
- Base preparada para historial de interacciones y plantillas reutilizables

## Puesta en marcha

```bash
git clone https://github.com/oortiz1186/PROSPECT2.git
cd PROSPECT2
git checkout feature/prospect-crm-mvp
cp .env.example .env
docker compose up -d
npm install
npx prisma migrate dev --name init
npm run dev
```

Abrir `http://localhost:3000`.

## Cargar los prospectos
En la pantalla principal pulsa **Importar Excel** y selecciona el tipo de dataset:
- `Pequeñas empresas`
- `Medianas empresas`

El importador reconoce las columnas generadas en los Excel de prospección y deja los campos faltantes disponibles para completarlos manualmente.

## Mensajes
Cada prospecto puede generar un mensaje de WhatsApp a partir de su nombre, segmento, oferta y precio. El generador está en `src/lib/message.ts` y usa variables como:
- `{{negocio}}`
- `{{contacto}}`
- `{{segmento}}`
- `{{oferta}}`
- `{{precio}}`

## Próximas mejoras recomendadas
1. Editor CRUD de plantillas desde la interfaz.
2. Historial de llamadas/WhatsApp y fecha de próximo seguimiento.
3. Kanban por estado comercial.
4. Dashboard de conversión y monto potencial.
5. Integración opcional con IA para generar mensajes personalizados con base en el giro y problema detectado.
6. Usuarios/login si se va a usar con más personas.
