"use client";
import { useState } from "react";
import Link from "next/link";
import { useDemo } from "@/ui/demo-shell";
import { useLocale } from "@/ui/use-locale";
import OnboardingScreen from "@/features/children/onboarding-screen";
import { businessDate, type BookingMode, type Nanny } from "./service";
export default function BookingScreen({
  nanny,
  initialMode,
  tomorrow,
}: {
  nanny: Nanny;
  initialMode: BookingMode;
  tomorrow: string;
}) {
  const { childProfile, bookingState, dispatchBooking } = useDemo();
  const { locale, t, f } = useLocale();
  const [mode, setMode] = useState(initialMode);
  const [date, setDate] = useState(tomorrow);
  const [time, setTime] = useState("09:00");
  const [hours, setHours] = useState(2);
  const [months, setMonths] = useState(1);
  const [weeklyHours, setWeeklyHours] = useState(40);
  const [attempt, setAttempt] = useState("");
  if (!childProfile) return <OnboardingScreen />;
  const created = bookingState.items.find((item) => item.id === attempt);
  const error =
    bookingState.error?.id === attempt ? bookingState.error.code : null;
  const rate = nanny.rates[mode];
  const estimate =
    rate === null
      ? null
      : rate * (mode === "hourly" ? hours : mode === "monthly" ? months : 1);
  return (
    <div className="narrow-page">
      <div className="page-heading">
        <Link href={`/${locale}/nannies`} className="text-link">
          {f.backNannies}
        </Link>
        <h1>{f.bookingTitle}</h1>
        <p className="lead">
          {nanny.name[locale]} · {nanny.city}
        </p>
      </div>
      <p className="notice">{f.nannyDemo}</p>
      {created ? (
        <section className="profile-panel" aria-label={f.bookingCreated}>
          <span className="tag">{f.reserved}</span>
          <h2>{f.bookingCreated}</h2>
          <p>
            {f[created.mode]} · {created.startDate}
            {created.mode === "hourly" ? ` · ${created.startTime}` : ""}
          </p>
          <p>{f.bookingNotice}</p>
          <Link className="button primary" href={`/${locale}/bookings`}>
            {f.viewBookings}
          </Link>
        </section>
      ) : (
        <form
          className="profile-panel booking-form"
          onSubmit={(e) => {
            e.preventDefault();
            const id = crypto.randomUUID();
            setAttempt(id);
            dispatchBooking({
              type: "reserve",
              draft: {
                id,
                nannyId: nanny.id,
                mode,
                startDate: date,
                startTime: time,
                hours,
                months,
                weeklyHours,
              },
              profile: childProfile,
              now: Date.now(),
            });
          }}
        >
          <div className="form-grid">
            <label>
              {f.mode}
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as BookingMode)}
              >
                {nanny.modes.map((m) => (
                  <option value={m} key={m}>
                    {f[m]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {f.startDate}
              <input
                type="date"
                value={date}
                required
                min={businessDate()}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            {mode === "hourly" ? (
              <>
                <label>
                  {f.startTime}
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </label>
                <label>
                  {f.hours}
                  <input
                    type="number"
                    required
                    min={1}
                    max={8}
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                  />
                </label>
              </>
            ) : mode === "monthly" ? (
              <label>
                {f.months}
                <input
                  type="number"
                  required
                  min={1}
                  max={12}
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                />
              </label>
            ) : (
              <label>
                {f.weeklyHours}
                <input
                  type="number"
                  required
                  min={1}
                  max={60}
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                />
              </label>
            )}
          </div>
          <p className="booking-price">
            {f.estimated}:{" "}
            <b>
              {estimate === null
                ? f.negotiable
                : `${new Intl.NumberFormat(locale).format(estimate)} ₸`}
            </b>
            {mode === "permanent" ? ` ${f.perMonth}` : ""}
          </p>
          <p className="quiet">{f.nannyUnverified}</p>
          {error && (
            <p className="form-error" role="alert">
              {f[error]}
            </p>
          )}
          {(childProfile.age === null || error === "bookingAge") && (
            <Link href={`/${locale}/profile/child`}>{f.editProfile}</Link>
          )}
          <div className="actions">
            <button className="button primary">{f.bookingSubmit}</button>
            <Link className="button light" href={`/${locale}/bookings`}>
              {f.bookings}
            </Link>
          </div>
        </form>
      )}
      <p className="quiet">{t.session}</p>
    </div>
  );
}
