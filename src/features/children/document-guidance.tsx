"use client";
import Link from "next/link";
import { useLocale } from "@/ui/use-locale";

/**
 * Справочные организационные шаги для семьи без справок. Не диагноз, не
 * назначение и не обещание льгот. Источник для МСЭ — официальная страница услуги.
 */
export default function DocumentGuidance() {
  const { locale, f } = useLocale();
  return (
    <section className="guidance" aria-labelledby="guidance-title">
      <h2 id="guidance-title">{f.guidanceTitle}</h2>
      <p className="quiet">{f.guidanceLead}</p>
      <ol>
        <li>{f.guidanceStep1}</li>
        <li>{f.guidanceStep2}</li>
        <li>
          {f.guidanceStep3}{" "}
          <a
            href="https://www.gov.kz/services/3031?lang=ru"
            target="_blank"
            rel="noopener noreferrer"
          >
            {f.guidanceSource}
          </a>
        </li>
        <li>{f.guidanceStep4}</li>
      </ol>
      <p className="quiet">{f.guidanceNote}</p>
      <Link className="button light" href={`/${locale}/catalog?audience=child`}>
        {f.guidanceCatalog}
      </Link>
    </section>
  );
}
