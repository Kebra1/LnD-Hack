import CatalogScreen from "@/features/catalog/catalog-screen";
export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ audience?: string }>;
}) {
  const { audience } = await searchParams;
  return (
    <CatalogScreen
      key={audience ?? "all"}
      audience={audience === "child" || audience === "adult" ? audience : ""}
    />
  );
}
