import "./globals.css";

export const metadata = {
  title: "PROSPECT2",
  description: "CRM ligero de prospección comercial",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
