import { notFound } from "next/navigation";
import { offerings } from "@/features/catalog/service";
import ContactScreen from "@/features/catalog/contact-screen";
export default async function ContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = offerings.find((item) => item.id === id);
  if (!item) notFound();
  return <ContactScreen offering={item} />;
}
