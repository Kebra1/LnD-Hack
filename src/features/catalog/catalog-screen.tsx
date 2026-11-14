"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { type Filters, type Offering } from "./contracts";
import { emptyFilters, searchOfferings } from "./service";
import { localizeOffering } from "./translations";
import { toggleComparison } from "./comparison";
import OfferingSummary from "./offering-summary";
import { useDemo } from "@/ui/demo-shell";
import { useLocale } from "@/ui/use-locale";
import { categoryLabels } from "@/locales/messages";
import { LineIcon } from "@/ui/brand-art";
import OnboardingScreen from "@/features/children/onboarding-screen";
import { profileCity } from "@/features/children/service";
function OfferingDetails({
  item,
  close,
}: {
  item: Offering;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [goalId, setGoalId] = useState("");
  const { goals, dispatch, notify } = useDemo();
  const { locale, t } = useLocale();
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  const saved = goals.some(
    (g) =>
      g.id === (goalId || `offering-${item.id}`) &&
      g.offeringIds.includes(item.id),
  );
  function save() {
    if (goalId) dispatch({ type: "offering", id: goalId, offeringId: item.id });
    else
      dispatch({
        type: "add",
        goal: {
          id: `offering-${item.id}`,
          title: item.service,
          done: false,
          offeringIds: [item.id],
          origin: "manual",
          quote: null,
          historical: false,
        },
      });
    notify(t.savedNotice);
  }
  return (
    <dialog ref={ref} aria-labelledby="offering-title" onCancel={close}>
      <div className="card-top">
        <span className="tag">{t.demo}</span>
        <button className="icon-button" onClick={close} aria-label={t.close}>
          ×
        </button>
      </div>
      <OfferingSummary item={item} headingId="offering-title" />
      <label>
        {t.addToGoal}
        <select value={goalId} onChange={(e) => setGoalId(e.target.value)}>
          <option value="">{t.newGoal}</option>
          {goals.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>
      </label>
      <div className="actions">
        <button className="button primary" onClick={save} disabled={saved}>
          {saved ? t.saved : t.save}
        </button>
        <Link
          className="button light"
          href={`/${locale}/route`}
          onClick={close}
        >
          {t.toPlan}
        </Link>
        <Link
          className="text-link"
          href={`/${locale}/providers/${item.id}`}
          onClick={close}
        >
          {t.fullProfile}
        </Link>
      </div>
    </dialog>
  );
}
export default function CatalogScreen({
  audience,
}: {
  audience: Filters["audience"];
}) {
  const {
    filtersByAudience,
    setFiltersByAudience,
    comparisonIds,
    setComparisonIds,
    notify,
    childProfile,
  } = useDemo();
  const { locale, t, f } = useLocale();
  const [showAll, setShowAll] = useState(false);
  const personal = audience !== "adult" && !showAll && !!childProfile;
  const key = `${audience || "all"}:${personal ? childProfile!.revision : "all"}`;
  const filters = filtersByAudience[key] ?? {
    ...emptyFilters,
    audience,
    ...(personal
      ? {
          city: profileCity(childProfile!),
          age: childProfile!.age === null ? "" : String(childProfile!.age),
          language: childProfile!.language,
        }
      : {}),
  };
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const results = searchOfferings(filters)
    .filter((item) => !personal || item.audience === "child")
    .filter(
      (item) =>
        !personal ||
        !!filters.category ||
        !childProfile!.needs.length ||
        childProfile!.needs.includes(item.category),
    )
    .map((item) => localizeOffering(item, locale));
  const selected = results.find((item) => item.id === selectedId);
  function change<K extends keyof Filters>(field: K, value: Filters[K]) {
    setFiltersByAudience((previous) => ({
      ...previous,
      [key]: { ...filters, [field]: value },
    }));
  }
  function reset() {
    setFiltersByAudience((previous) => ({
      ...previous,
      [key]: {
        ...emptyFilters,
        ...(personal
          ? {
              audience: "child",
              age: childProfile!.age === null ? "" : String(childProfile!.age),
              city: profileCity(childProfile!),
              language: childProfile!.language,
            }
          : {}),
      },
    }));
  }
  if (!childProfile && audience !== "adult") return <OnboardingScreen />;
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">{t.demo}</p>
        <h1>{t.catalogTitle}</h1>
        <p className="lead">{t.catalogLead}</p>
      </div>
      <p className="notice">{t.demoNotice}</p>
      {audience !== "adult" && (
        <div className="profile-match">
          <div>
            <b>{personal ? f.personalized : f.allSpecialists}</b>
            <p>{f.recommendLead}</p>
          </div>
          <Link href={`/${locale}/profile/child`} className="text-link">
            {f.editProfile}
          </Link>
          <button className="button light" onClick={() => setShowAll(!showAll)}>
            {personal ? f.allSpecialists : f.useProfile}
          </button>
        </div>
      )}
      <label className="search-field">
        {f.search}
        <input
          type="search"
          placeholder={f.searchSpecialists}
          value={filters.query ?? ""}
          onChange={(e) => change("query", e.target.value)}
        />
      </label>
      <div className="catalog-layout">
        <aside className="filters">
          <h2>{t.filtersTitle}</h2>
          <label>
            {t.audience}
            <select
              value={filters.audience}
              onChange={(e) =>
                change("audience", e.target.value as Filters["audience"])
              }
            >
              <option value="">{t.everyone}</option>
              <option value="child">{t.child}</option>
              <option value="adult">{t.adult}</option>
            </select>
          </label>
          <label>
            {t.city}
            <select
              value={filters.city}
              onChange={(e) => change("city", e.target.value)}
            >
              <option value="">{t.anyCity}</option>
              <option>Алматы</option>
              <option>Астана</option>
            </select>
          </label>
          <label>
            {t.age}
            <input
              type="number"
              min="0"
              max="99"
              placeholder={t.agePlaceholder}
              value={filters.age}
              onChange={(e) => change("age", e.target.value)}
            />
          </label>
          <label>
            {t.category}
            <select
              value={filters.category}
              onChange={(e) => change("category", e.target.value)}
            >
              <option value="">{t.anyCategory}</option>
              {Object.entries(categoryLabels(locale)).map(([id, title]) => (
                <option key={id} value={id}>
                  {title}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t.lessonLanguage}
            <select
              value={filters.language}
              onChange={(e) => change("language", e.target.value)}
            >
              <option value="">{t.anyLanguage}</option>
              <option value="ru">{t.russian}</option>
              <option value="kk">{t.kazakh}</option>
            </select>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={filters.includeUnknown}
              onChange={(e) => change("includeUnknown", e.target.checked)}
            />
            {t.unknownAgeToggle}
          </label>
          <button className="button light full" onClick={reset}>
            {t.reset}
          </button>
        </aside>
        <section aria-label={t.catalogTitle}>
          <div className="results-heading">
            <p role="status">
              {t.resultCount}: <b>{results.length}</b>
            </p>
            <Link className="text-link" href={`/${locale}/compare`}>
              {t.compare} ({comparisonIds.length}/3)
            </Link>
          </div>
          {results.length === 0 ? (
            <div className="empty">
              <h2>{t.noResults}</h2>
              <p>{t.noResultsBody}</p>
              <button className="button primary" onClick={reset}>
                {t.reset}
              </button>
            </div>
          ) : (
            <>
              <details className="match-explanation">
                <summary>{t.matched}</summary>
                <p>{t.matchingBody}</p>
              </details>
              <div className="catalog-cards">
                {results.map((item) => {
                  const compared = comparisonIds.includes(item.id);
                  return (
                    <article className="offering-card" key={item.id}>
                      <div className="card-top">
                        <span className="tag">{item.kind}</span>
                        <span className="quiet">
                          {item.city} · {t.demo}
                        </span>
                      </div>
                      <div className="provider-heading">
                        <span className="provider-avatar">
                          <LineIcon
                            name={
                              item.kind === "Центр" || item.kind === "Орталық"
                                ? "center"
                                : "person"
                            }
                          />
                        </span>
                        <div>
                          <h2>{item.name}</h2>
                          <h3>{item.service}</h3>
                        </div>
                      </div>
                      <p>{item.description}</p>
                      <div className="chips">
                        <span>
                          {item.ages
                            ? `${item.ages[0]}–${item.ages[1]} ${t.years}`
                            : t.unknownAge}
                        </span>
                        <span>
                          {item.languages
                            ?.map((l) => (l === "ru" ? t.russian : t.kazakh))
                            .join(" / ") ?? t.unknownLanguage}
                        </span>
                      </div>
                      <p className="quiet">{t.notVerified}</p>
                      <div className="card-bottom">
                        <b>{item.price}</b>
                        <div className="card-actions">
                          <button
                            className="button light"
                            aria-pressed={compared}
                            onClick={() => {
                              if (!compared && comparisonIds.length >= 3) {
                                notify(t.compareLimit);
                                return;
                              }
                              setComparisonIds((ids) =>
                                toggleComparison(ids, item.id),
                              );
                            }}
                          >
                            {compared ? t.compareRemove : t.compareAdd}
                          </button>
                          <button
                            className="button primary"
                            onClick={() => setSelectedId(item.id)}
                          >
                            {t.details}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>
      {selected && (
        <OfferingDetails item={selected} close={() => setSelectedId(null)} />
      )}
    </>
  );
}
