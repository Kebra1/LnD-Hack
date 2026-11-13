"use client";
import { usePathname } from "next/navigation";
import { messages, parseLocale } from "@/locales/messages";
import { familyMessages } from "@/locales/family";
export function useLocale() {
  const pathname = usePathname();
  const locale = parseLocale(pathname.split("/")[1] ?? "") ?? "ru";
  return { locale, t: messages[locale], f: familyMessages[locale] };
}
