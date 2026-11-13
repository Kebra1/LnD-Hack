import { matchesSearch } from "@/lib/search";
import type { ChildProfile } from "../children/service";
import type { Locale } from "@/locales/messages";
export type BookingMode = "hourly" | "monthly" | "permanent";
export interface Nanny {
  id: string;
  name: Record<Locale, string>;
  city: string;
  ages: [number, number];
  languages: string[];
  skills: Record<Locale, string>;
  modes: BookingMode[];
  rates: Record<BookingMode, number | null>;
}
export const nannies: Nanny[] = [
  {
    id: "nanny-a",
    name: { ru: "Амина С.", kk: "Әмина С." },
    city: "Алматы",
    ages: [0, 12],
    languages: ["ru", "kk"],
    skills: {
      ru: "Игры по возрасту, прогулки, сопровождение повседневного распорядка",
      kk: "Жасқа сай ойындар, серуен, күнделікті тәртіпке көмектесу",
    },
    modes: ["hourly", "monthly", "permanent"],
    rates: { hourly: 2500, monthly: 240000, permanent: 280000 },
  },
  {
    id: "nanny-b",
    name: { ru: "Мария К.", kk: "Мария К." },
    city: "Алматы",
    ages: [3, 17],
    languages: ["ru"],
    skills: {
      ru: "Творческие занятия, чтение, сопровождение школьника",
      kk: "Шығармашылық, кітап оқу, оқушыны сүйемелдеу",
    },
    modes: ["hourly", "monthly"],
    rates: { hourly: 1800, monthly: 190000, permanent: null },
  },
  {
    id: "nanny-c",
    name: { ru: "Динара А.", kk: "Динара А." },
    city: "Астана",
    ages: [0, 6],
    languages: ["ru", "kk"],
    skills: {
      ru: "Повседневный уход и спокойные игры для дошкольников",
      kk: "Күнделікті күтім және мектепке дейінгі балалармен тыныш ойындар",
    },
    modes: ["monthly", "permanent"],
    rates: { hourly: null, monthly: 210000, permanent: 260000 },
  },
  {
    id: "nanny-d",
    name: { ru: "Сауле Т.", kk: "Сәуле Т." },
    city: "Алматы",
    ages: [6, 17],
    languages: ["ru", "kk"],
    skills: {
      ru: "Помощь с распорядком, настольные игры и сопровождение на занятия",
      kk: "Күн тәртібіне көмектесу, үстел ойындары, сабаққа сүйемелдеу",
    },
    modes: ["hourly", "permanent"],
    rates: { hourly: 2000, monthly: null, permanent: null },
  },
];
export function searchNannies(input: {
  query: string;
  city: string;
  mode: BookingMode | "";
  language: string;
  maxHourly: string;
  profile: ChildProfile | null;
}) {
  return nannies.filter((n) => {
    if (input.city && n.city !== input.city) return false;
    if (input.mode && !n.modes.includes(input.mode)) return false;
    if (input.language && !n.languages.includes(input.language)) return false;
    if (input.profile) {
      const p = input.profile;
      if (p.age !== null && (p.age < n.ages[0] || p.age > n.ages[1]))
        return false;
    }
    if (input.maxHourly) {
      const max = Number(input.maxHourly);
      if (
        !Number.isFinite(max) ||
        max < 0 ||
        n.rates.hourly === null ||
        n.rates.hourly > max
      )
        return false;
    }
    return matchesSearch(
      `${n.name.ru} ${n.name.kk} ${n.skills.ru} ${n.skills.kk} ${n.city}`,
      input.query,
    );
  });
}
export interface BookingDraft {
  id: string;
  nannyId: string;
  mode: BookingMode;
  startDate: string;
  startTime: string;
  hours: number;
  months: number;
  weeklyHours: number;
}
export interface Booking extends BookingDraft {
  status: "reserved" | "cancelled";
  childAge: number;
  start: number;
  end: number | null;
  estimated: number | null;
  createdAt: number;
}
export type BookingError =
  "bookingConflict" | "bookingInvalid" | "bookingAge" | "bookingUnsupported";
export interface BookingState {
  items: Booking[];
  error: { id: string; code: BookingError } | null;
}
export function businessDate(now = Date.now()) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Almaty",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(now));
}
export function nextBusinessDate(now = Date.now()) {
  return businessDate(now + 86400000);
}
function validDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(+d) && d.toISOString().slice(0, 10) === date;
}
function endMonth(date: string, months: number) {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  const first = new Date(Date.UTC(y, m - 1 + months, 1));
  const last = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return Date.parse(
    `${first.getUTCFullYear()}-${String(first.getUTCMonth() + 1).padStart(2, "0")}-${String(Math.min(d, last)).padStart(2, "0")}T00:00:00+05:00`,
  );
}
export function prepareBooking(
  draft: BookingDraft,
  profile: ChildProfile | null,
  existing: Booking[],
  now = Date.now(),
): Booking | BookingError {
  const nanny = nannies.find((n) => n.id === draft.nannyId);
  if (!nanny || !nanny.modes.includes(draft.mode)) return "bookingUnsupported";
  if (
    profile?.age === null ||
    profile?.age === undefined ||
    profile.age < nanny.ages[0] ||
    profile.age > nanny.ages[1]
  )
    return "bookingAge";
  if (
    !validDate(draft.startDate) ||
    !draft.id ||
    !Number.isInteger(draft.hours) ||
    draft.hours < 1 ||
    draft.hours > 8 ||
    !Number.isInteger(draft.months) ||
    draft.months < 1 ||
    draft.months > 12 ||
    !Number.isInteger(draft.weeklyHours) ||
    draft.weeklyHours < 1 ||
    draft.weeklyHours > 60
  )
    return "bookingInvalid";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.startTime))
    return "bookingInvalid";
  const start = Date.parse(
    `${draft.startDate}T${draft.mode === "hourly" ? draft.startTime : "00:00"}:00+05:00`,
  );
  if (!Number.isFinite(start) || start <= now) return "bookingInvalid";
  const end =
    draft.mode === "hourly"
      ? start + draft.hours * 3600000
      : draft.mode === "monthly"
        ? endMonth(draft.startDate, draft.months)
        : null;
  if (
    existing.some(
      (b) =>
        b.id !== draft.id &&
        b.nannyId === draft.nannyId &&
        b.status === "reserved" &&
        start < (b.end ?? Infinity) &&
        (end ?? Infinity) > b.start,
    )
  )
    return "bookingConflict";
  const rate = nanny.rates[draft.mode];
  return {
    ...draft,
    start,
    end,
    status: "reserved",
    childAge: profile.age,
    estimated:
      rate === null
        ? null
        : rate *
          (draft.mode === "hourly"
            ? draft.hours
            : draft.mode === "monthly"
              ? draft.months
              : 1),
    createdAt: now,
  };
}
export type BookingAction =
  | { type: "clear" }
  | {
      type: "reserve";
      draft: BookingDraft;
      profile: ChildProfile | null;
      now: number;
    }
  | { type: "cancel"; id: string };
export function bookingReducer(
  state: BookingState,
  action: BookingAction,
): BookingState {
  if (action.type === "clear") return { items: [], error: null };
  if (action.type === "cancel")
    return {
      ...state,
      items: state.items.map((b) =>
        b.id === action.id ? { ...b, status: "cancelled" } : b,
      ),
      error: null,
    };
  if (state.items.some((b) => b.id === action.draft.id)) return state;
  const result = prepareBooking(
    action.draft,
    action.profile,
    state.items,
    action.now,
  );
  return typeof result === "string"
    ? { ...state, error: { id: action.draft.id, code: result } }
    : { items: [...state.items, result], error: null };
}
