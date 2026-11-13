import { notFound } from "next/navigation";
import DemoShell from "@/ui/demo-shell";
import { messages, parseLocale } from "@/locales/messages";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = parseLocale((await params).locale);
  if (!locale) return {};
  const t = messages[locale];
  return { title: `${t.brand} — ${t.tagline}`, description: t.heroLead };
}
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  if (!parseLocale((await params).locale)) notFound();
  return <DemoShell>{children}</DemoShell>;
}
