import { notFound } from "next/navigation";
import { offerings } from "@/features/catalog/service";
import ProfileScreen from "@/features/catalog/profile-screen";
export default async function ProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const offering = offerings.find((item) => item.id === id);
  if (!offering) notFound();
  return <ProfileScreen offering={offering} />;
}
