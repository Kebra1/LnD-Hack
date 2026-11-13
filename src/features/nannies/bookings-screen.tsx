"use client";
import Link from "next/link";
import { useDemo } from "@/ui/demo-shell";
import { useLocale } from "@/ui/use-locale";
import { nannies } from "./service";
export default function BookingsScreen() {
  const { bookingState, dispatchBooking, notify } = useDemo();
  const { locale, t, f } = useLocale();
  return (
    <>
      <div className="page-heading">
        <h1>{f.bookings}</h1>
        <Link href={`/${locale}/nannies`}>{f.backNannies}</Link>
      </div>
      <p className="notice">
        {f.bookingNotice} {t.session}
      </p>
      {bookingState.items.length === 0 ? (
        <div className="empty">
          <h2>{f.noBookings}</h2>
          <p>{f.noBookingsBody}</p>
          <Link className="button primary" href={`/${locale}/nannies`}>
            {f.browseNannies}
          </Link>
        </div>
      ) : (
        <div className="booking-list">
          {[...bookingState.items].reverse().map((b) => (
            <article
              className={`offering-card ${b.status === "cancelled" ? "cancelled-booking" : ""}`}
              key={b.id}
            >
              <div className="card-top">
                <h2>{nannies.find((n) => n.id === b.nannyId)?.name[locale]}</h2>
                <span className="tag">
                  {b.status === "reserved" ? f.reserved : f.cancelled}
                </span>
              </div>
              <dl>
                <dt>{f.mode}</dt>
                <dd>
                  {f[b.mode]}
                  {b.mode === "permanent"
                    ? ` · ${b.weeklyHours} ${f.weeklyHours.toLowerCase()}`
                    : ""}
                </dd>
                <dt>{f.period}</dt>
                <dd>
                  {new Date(b.start).toLocaleString(
                    locale === "ru" ? "ru-RU" : "kk-KZ",
                    {
                      timeZone: "Asia/Almaty",
                      dateStyle: "short",
                      ...(b.mode === "hourly"
                        ? { timeStyle: "short" as const }
                        : {}),
                    },
                  )}{" "}
                  →{" "}
                  {b.end === null
                    ? f.endless
                    : new Date(b.end).toLocaleString(
                        locale === "ru" ? "ru-RU" : "kk-KZ",
                        {
                          timeZone: "Asia/Almaty",
                          dateStyle: "short",
                          ...(b.mode === "hourly"
                            ? { timeStyle: "short" as const }
                            : {}),
                        },
                      )}
                </dd>
                <dt>{f.bookingProfileSnapshot}</dt>
                <dd>
                  {b.childAge} {t.years}
                </dd>
                <dt>{f.estimated}</dt>
                <dd>
                  {b.estimated === null
                    ? f.negotiable
                    : `${new Intl.NumberFormat(locale).format(b.estimated)} ₸`}
                  {b.mode === "permanent" ? ` ${f.perMonth}` : ""}
                </dd>
              </dl>
              {b.status === "reserved" && (
                <button
                  className="button light"
                  onClick={() => {
                    dispatchBooking({ type: "cancel", id: b.id });
                    notify(f.cancelledNotice);
                  }}
                >
                  {f.cancelBooking}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
