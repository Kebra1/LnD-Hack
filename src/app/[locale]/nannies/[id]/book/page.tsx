import { notFound } from "next/navigation";
import BookingScreen from "@/features/nannies/booking-screen";
import { nannies, nextBusinessDate } from "@/features/nannies/service";
export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { id } = await params;
  const { mode } = await searchParams;
  const nanny = nannies.find((n) => n.id === id);
  if (!nanny) notFound();
  const initialMode = nanny.modes.find((m) => m === mode) ?? nanny.modes[0]!;
  return (
    <BookingScreen
      nanny={nanny}
      initialMode={initialMode}
      tomorrow={nextBusinessDate()}
    />
  );
}
