"use client";
import Link from "next/link";
import { useDemo } from "@/ui/demo-shell";
import { useLocale } from "@/ui/use-locale";
import { offerings } from "@/features/catalog/service";
import { localizeOffering } from "@/features/catalog/translations";
export default function ComparePage() {
  const { comparisonIds, setComparisonIds } = useDemo();
  const { locale, t } = useLocale();
  const items = comparisonIds.flatMap((id) => {
    const item = offerings.find((o) => o.id === id);
    return item ? [localizeOffering(item, locale)] : [];
  });
  return (
    <>
      <div className="page-heading">
        <h1>{t.compareTitle}</h1>
        <p className="lead">{t.compareLead}</p>
      </div>
      <p className="notice">{t.demoNotice}</p>
      {items.length < 2 && (
        <div className="empty">
          <h2>{items.length ? t.compareNeedTwo : t.compareEmpty}</h2>
          <Link
            className="button primary"
            href={`/${locale}/catalog?audience=child`}
          >
            {t.backCatalog}
          </Link>
        </div>
      )}
      {items.length > 0 && (
        <>
          <div className="results-heading">
            <p>
              {t.compareCount}: {items.length}/3
            </p>
            <button
              className="text-button"
              onClick={() => setComparisonIds([])}
            >
              {t.clearCompare}
            </button>
          </div>
          <div className="comparison-grid">
            {items.map((item) => (
              <article className="offering-card" key={item.id}>
                <div className="card-top">
                  <span className="tag">{item.kind}</span>
                  <button
                    className="text-button"
                    onClick={() =>
                      setComparisonIds((ids) =>
                        ids.filter((id) => id !== item.id),
                      )
                    }
                    aria-label={`${t.remove}: ${item.name}`}
                  >
                    {t.remove}
                  </button>
                </div>
                <h2>{item.name}</h2>
                <h3>{item.service}</h3>
                <dl>
                  <dt>{t.city}</dt>
                  <dd>{item.city}</dd>
                  <dt>{t.age}</dt>
                  <dd>
                    {item.ages
                      ? `${item.ages[0]}–${item.ages[1]} ${t.years}`
                      : t.unknownAge}
                  </dd>
                  <dt>{t.lessonLanguage}</dt>
                  <dd>
                    {item.languages
                      ?.map((l) => (l === "ru" ? t.russian : t.kazakh))
                      .join(" / ") ?? t.unknownLanguage}
                  </dd>
                  <dt>{t.price}</dt>
                  <dd>{item.price}</dd>
                  <dt>{t.conditions}</dt>
                  <dd>{item.conditions}</dd>
                  <dt>{t.qualification}</dt>
                  <dd>{t.notVerified}</dd>
                </dl>
                <Link
                  className="button primary full"
                  href={`/${locale}/providers/${item.id}`}
                >
                  {t.fullProfile}
                </Link>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  );
}
