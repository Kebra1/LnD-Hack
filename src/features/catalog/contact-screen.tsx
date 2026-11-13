"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import type { Offering } from "./contracts";
import { localizeOffering } from "./translations";
import { useLocale } from "@/ui/use-locale";
import { useDemo } from "@/ui/demo-shell";
export default function ContactScreen({ offering }: { offering: Offering }) {
  const { locale, t } = useLocale();
  const { notify } = useDemo();
  const item = localizeOffering(offering, locale);
  const [draft, setDraft] = useState(t.draft);
  const [fallback, setFallback] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  async function copy() {
    try {
      await navigator.clipboard.writeText(draft);
      setFallback(false);
      notify(t.copied);
    } catch {
      setFallback(true);
      ref.current?.focus();
      ref.current?.select();
    }
  }
  return (
    <div className="narrow-page">
      <div className="page-heading">
        <h1>{t.contactTitle}</h1>
        <p className="lead">{t.contactLead}</p>
      </div>
      <p className="notice">{t.contactDemo}</p>
      <section className="profile-panel">
        <h2>{item.name}</h2>
        <p>{item.service}</p>
        <p className="quiet">
          {t.contact}: {item.contact}
        </p>
        <label htmlFor="contact-draft">{t.draftLabel}</label>
        <textarea
          id="contact-draft"
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={2000}
          rows={7}
        />
        <p className="quiet">{t.draftPrivacy}</p>
        {fallback && <p role="status">{t.copyFallback}</p>}
        <div className="actions">
          <button
            className="button primary"
            disabled={!draft.trim()}
            onClick={copy}
          >
            {t.copy}
          </button>
          <button className="button light" onClick={() => setDraft(t.draft)}>
            {t.restoreDraft}
          </button>
          <Link className="button light" href={`/${locale}/route`}>
            {t.toPlan}
          </Link>
        </div>
      </section>
    </div>
  );
}
