"use client";
import type { Offering } from "./contracts";
import { useLocale } from "@/ui/use-locale";
import { LineIcon } from "@/ui/brand-art";
export default function OfferingSummary({
  item,
  headingId,
}: {
  item: Offering;
  headingId?: string;
}) {
  const { t } = useLocale();
  return (
    <>
      <div className="profile-name">
        <span className="provider-avatar">
          <LineIcon
            name={
              item.kind === "Центр" || item.kind === "Орталық"
                ? "center"
                : "person"
            }
          />
        </span>
        <h2 id={headingId}>{item.name}</h2>
      </div>
      <h3>{item.service}</h3>
      <p>{item.description}</p>
      <dl>
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
        <dt>{t.address}</dt>
        <dd>
          {item.city}, {item.address}
        </dd>
        <dt>{t.conditions}</dt>
        <dd>{item.conditions}</dd>
        <dt>{t.price}</dt>
        <dd>{item.price}</dd>
        <dt>{t.contact}</dt>
        <dd>{item.contact}</dd>
        <dt>{t.source}</dt>
        <dd>{item.source}</dd>
      </dl>
      <details className="trust-box">
        <summary>{t.trustTitle}</summary>
        <p>{t.trustBody}</p>
      </details>
    </>
  );
}
