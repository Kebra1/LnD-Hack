import type { Category } from "../catalog/contracts";
import { emptyFilters, searchOfferings } from "../catalog/service";
export const documentCodes = ["pmpk", "disability", "ipr", "doctor"] as const;
export type DocumentCode = (typeof documentCodes)[number];
export type DocumentsStatus = "" | "have" | "none" | "unsure";
export interface ChildProfile {
  parentName: string;
  alias: string;
  age: number | null;
  city: string;
  language: "" | "ru" | "kk";
  needs: Category[];
  /** Частный свободный текст со слов семьи; не используется для подбора. */
  diagnosis: string;
  documentsStatus: DocumentsStatus;
  documents: DocumentCode[];
  revision: number;
}
/** «Другой город» не фильтрует каталог: в демо только Алматы и Астана. */
export function profileCity(profile: Pick<ChildProfile, "city">) {
  return profile.city === "other" ? "" : profile.city;
}
export function needsGuidance(profile: Pick<ChildProfile, "documentsStatus">) {
  return (
    profile.documentsStatus === "none" || profile.documentsStatus === "unsure"
  );
}
export const needCodes: Category[] = [
  "communication",
  "development",
  "psychology",
  "mobility",
];
export function validProfile(profile: ChildProfile) {
  return (
    profile.parentName.length <= 60 &&
    profile.diagnosis.length <= 120 &&
    ["", "have", "none", "unsure"].includes(profile.documentsStatus) &&
    profile.documents.every((code) => documentCodes.includes(code)) &&
    profile.alias.length <= 30 &&
    (profile.age === null ||
      (Number.isInteger(profile.age) &&
        profile.age >= 0 &&
        profile.age <= 21)) &&
    ["", "Алматы", "Астана", "other"].includes(profile.city) &&
    ["", "ru", "kk"].includes(profile.language) &&
    profile.needs.every((code) => needCodes.includes(code))
  );
}
export function recommendOfferings(profile: ChildProfile) {
  return searchOfferings({
    ...emptyFilters,
    audience: "child",
    age: profile.age === null ? "" : String(profile.age),
    city: profileCity(profile),
    language: profile.language,
  }).filter(
    (item) => !profile.needs.length || profile.needs.includes(item.category),
  );
}
