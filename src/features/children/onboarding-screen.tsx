"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemo } from "@/ui/demo-shell";
import { useLocale } from "@/ui/use-locale";
import { categoryLabels } from "@/locales/messages";
import { needCodes, validProfile, type ChildProfile } from "./service";
export default function OnboardingScreen() {
  const {
    childProfile,
    setChildProfile,
    setFiltersByAudience,
    dispatchBooking,
    notify,
  } = useDemo();
  const { locale, t, f } = useLocale();
  const router = useRouter();
  const [alias, setAlias] = useState(childProfile?.alias ?? "");
  const [age, setAge] = useState(
    childProfile?.age === null || !childProfile ? "" : String(childProfile.age),
  );
  const [city, setCity] = useState(childProfile?.city ?? "");
  const [language, setLanguage] = useState<ChildProfile["language"]>(
    childProfile?.language ?? "",
  );
  const [needs, setNeeds] = useState(childProfile?.needs ?? []);
  const [error, setError] = useState(false);
  return (
    <div className="onboarding-page">
      <div className="page-heading">
        <p className="eyebrow">{f.childProfile}</p>
        <h1>{childProfile ? f.editProfile : f.onboarding}</h1>
        <p className="lead">{f.onboardingLead}</p>
      </div>
      <p className="notice">{f.demoPrivacy}</p>
      <form
        className="profile-panel onboarding-form"
        onSubmit={(e) => {
          e.preventDefault();
          const profile: ChildProfile = {
            alias: alias.trim(),
            age: age === "" ? null : Number(age),
            city,
            language,
            needs,
            revision: (childProfile?.revision ?? 0) + 1,
          };
          if (!validProfile(profile)) {
            setError(true);
            return;
          }
          setChildProfile(profile);
          setFiltersByAudience({});
          notify(f.profileSaved);
          router.push(`/${locale}`);
        }}
      >
        <div className="form-grid">
          <label>
            {f.alias}
            <input
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              maxLength={30}
              autoComplete="off"
            />
          </label>
          <label>
            {f.age}
            <input
              type="number"
              min={0}
              max={21}
              step={1}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder={f.unknown}
            />
          </label>
          <label>
            {f.city}
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">{f.unknown}</option>
              <option>Алматы</option>
              <option>Астана</option>
            </select>
          </label>
          <label>
            {f.language}
            <select
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value as ChildProfile["language"])
              }
            >
              <option value="">{f.unknown}</option>
              <option value="ru">{t.russian}</option>
              <option value="kk">{t.kazakh}</option>
            </select>
          </label>
        </div>
        <fieldset>
          <legend>{f.needs}</legend>
          <p className="quiet">{f.needsHint}</p>
          <div className="need-options">
            {needCodes.map((code) => (
              <label className="check need-option" key={code}>
                <input
                  type="checkbox"
                  checked={needs.includes(code)}
                  onChange={(e) =>
                    setNeeds((values) =>
                      e.target.checked
                        ? [...values, code]
                        : values.filter((v) => v !== code),
                    )
                  }
                />
                {categoryLabels(locale)[code]}
              </label>
            ))}
          </div>
        </fieldset>
        {error && (
          <p role="alert" className="form-error">
            {f.profileError}
          </p>
        )}
        <div className="actions">
          <button className="button primary">{f.saveProfile}</button>
          {childProfile && (
            <button
              className="text-button"
              type="button"
              onClick={() => {
                setChildProfile(null);
                dispatchBooking({ type: "clear" });
                setFiltersByAudience({});
                notify(f.profileDeleted);
                router.push(`/${locale}`);
              }}
            >
              {f.deleteProfile}
            </button>
          )}
        </div>
      </form>
      <Link className="text-link" href={`/${locale}/for-me`}>
        {f.motherWithoutProfile}
      </Link>
    </div>
  );
}
