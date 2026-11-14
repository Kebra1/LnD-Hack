import type { Category } from "../catalog/contracts";
import { emptyFilters, searchOfferings } from "../catalog/service";
import { cityNames } from "./cities";
export const documentCodes = ["pmpk", "disability", "ipr", "doctor"] as const;
export type DocumentCode = (typeof documentCodes)[number];
export type DocumentsStatus = "" | "have" | "none" | "unsure";
export const maxDocumentFiles = 5;
export const maxDocumentFileBytes = 10 * 1024 * 1024;
/** Только метаданные: содержимое файла нигде не хранится и не отправляется. */
export interface DocumentFile {
  name: string;
  size: number;
}
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
  documentFiles: DocumentFile[];
  revision: number;
}
/** В демо-каталоге специалисты только в Алматы и Астане; остальные города не фильтруют. */
export function profileCity(profile: Pick<ChildProfile, "city">) {
  return ["Алматы", "Астана"].includes(profile.city) ? profile.city : "";
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
    profile.documentFiles.length <= maxDocumentFiles &&
    profile.documentFiles.every(
      (file) =>
        file.name.length > 0 &&
        file.name.length <= 120 &&
        Number.isInteger(file.size) &&
        file.size >= 0 &&
        file.size <= maxDocumentFileBytes,
    ) &&
    profile.alias.length <= 30 &&
    (profile.age === null ||
      (Number.isInteger(profile.age) &&
        profile.age >= 0 &&
        profile.age <= 21)) &&
    (profile.city === "" || cityNames.includes(profile.city)) &&
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
