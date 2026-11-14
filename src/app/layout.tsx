import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { DemoProvider } from "@/ui/demo-shell";
import "./globals.css";
import "./brand.css";
import "./family.css";
export const metadata: Metadata = {
  title: "Бірге — поддержка семьи",
  description: "Помощь ребёнку и время для мамы. Учебный прототип.",
  applicationName: "Бірге",
  appleWebApp: { capable: true, title: "Бірге", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};
export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = (await headers()).get("x-mama-locale") === "kk" ? "kk" : "ru";
  return (
    <html lang={locale}>
      <body>
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}
