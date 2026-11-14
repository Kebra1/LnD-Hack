"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemo } from "@/ui/demo-shell";
import { useLocale } from "@/ui/use-locale";
import { categoryLabels } from "@/locales/messages";
import DocumentGuidance from "./document-guidance";
import { cityGroups } from "./cities";
import {
  documentCodes,
  maxDocumentFileBytes,
  maxDocumentFiles,
  needCodes,
  validProfile,
  type ChildProfile,
  type DocumentCode,
  type DocumentFile,
  type DocumentsStatus,
} from "./service";

const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];
const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} КБ`
    : `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

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
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [parentName, setParentName] = useState(childProfile?.parentName ?? "");
  const [city, setCity] = useState(childProfile?.city ?? "");
  const [age, setAge] = useState(
    childProfile?.age === null || !childProfile ? "" : String(childProfile.age),
  );
  const [diagnosis, setDiagnosis] = useState(childProfile?.diagnosis ?? "");
  const [status, setStatus] = useState<DocumentsStatus>(
    childProfile?.documentsStatus ?? "",
  );
  const [documents, setDocuments] = useState<DocumentCode[]>(
    childProfile?.documents ?? [],
  );
  const [files, setFiles] = useState<DocumentFile[]>(
    childProfile?.documentFiles ?? [],
  );
  const [fileError, setFileError] = useState("");
  const [language, setLanguage] = useState<ChildProfile["language"]>(
    childProfile?.language ?? "",
  );
  const [needs, setNeeds] = useState(childProfile?.needs ?? []);
  const [error, setError] = useState(false);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    headingRef.current?.focus();
  }, [step]);
  const docLabels: Record<DocumentCode, string> = {
    pmpk: f.docPmpk,
    disability: f.docDisability,
    ipr: f.docIpr,
    doctor: f.docDoctor,
  };
  const statusOptions: [Exclude<DocumentsStatus, "">, string][] = [
    ["have", f.docsHave],
    ["none", f.docsNone],
    ["unsure", f.docsUnsure],
  ];
  function addFiles(list: FileList | null) {
    if (!list) return;
    let message = "";
    const next = [...files];
    for (const file of Array.from(list)) {
      const name = file.name.toLowerCase();
      const typeOk =
        allowedTypes.includes(file.type) ||
        allowedExtensions.some((ext) => name.endsWith(ext));
      if (!typeOk) message = f.fileErrorType;
      else if (file.size > maxDocumentFileBytes) message = f.fileErrorSize;
      else if (next.length >= maxDocumentFiles) message = f.fileErrorCount;
      else next.push({ name: file.name.slice(0, 120), size: file.size });
    }
    setFiles(next);
    setFileError(message);
  }
  return (
    <div className="onboarding-page">
      <div className="page-heading">
        <p className="eyebrow">{step === 1 ? f.stepOne : f.stepTwo}</p>
        <div className="step-bar" aria-hidden="true">
          <span className="done" />
          <span className={step === 2 ? "done" : ""} />
        </div>
        <h1 ref={headingRef} tabIndex={-1}>
          {step === 2
            ? f.childStepTitle
            : childProfile
              ? f.editProfile
              : f.onboarding}
        </h1>
        <p className="lead">
          {step === 1 ? f.onboardingLead : f.childStepLead}
        </p>
      </div>
      <p className="notice">{f.demoPrivacy}</p>
      {step === 1 ? (
        <form
          className="profile-panel onboarding-form"
          onSubmit={(e) => {
            e.preventDefault();
            setStep(2);
          }}
        >
          <div className="form-stack">
            <label>
              {f.parentName}
              <input
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                maxLength={60}
                autoComplete="given-name"
              />
            </label>
            <label>
              {f.origin}
              <select value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">{f.unknown}</option>
                {cityGroups.map((group) => (
                  <optgroup key={group.id} label={group[locale]}>
                    {group.cities.map((item) => (
                      <option key={item.ru} value={item.ru}>
                        {item[locale]}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
          </div>
          <div className="actions">
            <button className="button primary">{f.next}</button>
          </div>
        </form>
      ) : (
        <form
          className="profile-panel onboarding-form"
          onSubmit={(e) => {
            e.preventDefault();
            const profile: ChildProfile = {
              parentName: parentName.trim(),
              alias: childProfile?.alias ?? "",
              age: age === "" ? null : Number(age),
              city,
              language,
              needs,
              diagnosis: diagnosis.trim(),
              documentsStatus: status,
              documents: status === "have" ? documents : [],
              documentFiles: status === "have" ? files : [],
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
          <div className="form-stack">
            <label>
              {f.age}
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={21}
                step={1}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder={f.unknown}
              />
            </label>
            <label>
              {f.diagnosisLabel}
              <input
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                maxLength={120}
                autoComplete="off"
                aria-describedby="diagnosis-hint"
              />
              <span id="diagnosis-hint" className="quiet">
                {f.diagnosisHint}
              </span>
            </label>
          </div>
          <fieldset>
            <legend>{f.documentsQuestion}</legend>
            <div className="choice-row">
              {statusOptions.map(([value, label]) => (
                <label className="check need-option" key={value}>
                  <input
                    type="radio"
                    name="documents-status"
                    checked={status === value}
                    onChange={() => setStatus(value)}
                  />
                  {label}
                </label>
              ))}
            </div>
            {status === "have" && (
              <div className="doc-options">
                <p className="quiet">{f.docsWhich}</p>
                {documentCodes.map((code) => (
                  <label className="check need-option" key={code}>
                    <input
                      type="checkbox"
                      checked={documents.includes(code)}
                      onChange={(e) =>
                        setDocuments((values) =>
                          e.target.checked
                            ? [...values, code]
                            : values.filter((v) => v !== code),
                        )
                      }
                    />
                    {docLabels[code]}
                  </label>
                ))}
                <div className="file-upload">
                  <b>{f.filesTitle}</b>
                  <p className="quiet">{f.filesHint}</p>
                  <label className="button light file-button">
                    {f.filesAdd}
                    <input
                      className="file-input"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      onChange={(e) => {
                        addFiles(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {fileError && (
                    <p role="alert" className="form-error">
                      {fileError}
                    </p>
                  )}
                  {files.length > 0 && (
                    <ul className="file-list">
                      {files.map((file, index) => (
                        <li key={`${file.name}-${index}`}>
                          <span>
                            {file.name} · {formatSize(file.size)}
                          </span>
                          <button
                            type="button"
                            className="text-button"
                            onClick={() =>
                              setFiles((list) =>
                                list.filter((_, i) => i !== index),
                              )
                            }
                          >
                            {f.fileRemove}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </fieldset>
          {(status === "none" || status === "unsure") && <DocumentGuidance />}
          <details className="more-options">
            <summary>{f.moreOptions}</summary>
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
          </details>
          {error && (
            <p role="alert" className="form-error">
              {f.profileError}
            </p>
          )}
          <div className="actions">
            <button className="button primary">{f.saveProfile}</button>
            <button
              className="button light"
              type="button"
              onClick={() => setStep(1)}
            >
              {f.back}
            </button>
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
      )}
      <Link className="text-link" href={`/${locale}/for-me`}>
        {f.motherWithoutProfile}
      </Link>
    </div>
  );
}
