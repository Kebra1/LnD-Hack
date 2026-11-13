import type { Category } from "../catalog/contracts";
import { emptyFilters, searchOfferings } from "../catalog/service";
export interface ChildProfile {
  alias: string;
  age: number | null;
  city: string;
  language: "" | "ru" | "kk";
  needs: Category[];
  revision: number;
}
export const needCodes: Category[] = [
  "communication",
  "development",
  "psychology",
  "mobility",
];
export function validProfile(profile: ChildProfile) {
  return (
    profile.alias.length <= 30 &&
    (profile.age === null ||
      (Number.isInteger(profile.age) &&
        profile.age >= 0 &&
        profile.age <= 21)) &&
    ["", "Алматы", "Астана"].includes(profile.city) &&
    ["", "ru", "kk"].includes(profile.language) &&
    profile.needs.every((code) => needCodes.includes(code))
  );
}
export function recommendOfferings(profile: ChildProfile) {
  return searchOfferings({
    ...emptyFilters,
    audience: "child",
    age: profile.age === null ? "" : String(profile.age),
    city: profile.city,
    language: profile.language,
  }).filter(
    (item) => !profile.needs.length || profile.needs.includes(item.category),
  );
}
