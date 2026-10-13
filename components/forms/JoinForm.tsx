"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SCHOOLS } from "@/lib/schools";
import { CONSENT_NOTICE_VERSION } from "@/lib/validation/member";
import { GlassCard } from "@/components/ui/GlassCard";
import { StepWizard } from "@/components/ui/StepWizard";
import { submitJoin } from "@/app/actions/member-actions";

const STEPS = ["account", "identity", "school", "personal", "location", "contact", "work", "family", "consent", "review"] as const;
const DRAFT_KEY = "vada-join-draft";

type Visibility = "MEMBERS" | "ADMINS_ONLY";

type Draft = {
  email: string;
  fullName: string;
  fullNameTa: string;
  nickname: string;
  gender: "female" | "male" | "undisclosed";
  dateOfBirth: string;
  schoolId: string;
  alStream: "MATHS" | "BIO" | "COMMERCE" | "ARTS" | "TECHNOLOGY" | "OTHER";
  admissionNo: string;
  city: string;
  country: string;
  address: string;
  mobile: string;
  whatsapp: string;
  profession: string;
  employer: string;
  jobTitle: string;
  maritalStatus: "single" | "married" | "other" | "undisclosed";
  spouseName: string;
  children: string;
  about: string;
  facebook: string;
  linkedin: string;
  instagram: string;
  website: string;
  photoKey: string;
  visibility: Record<"mobile" | "whatsapp" | "address" | "spouseName" | "children" | "admissionNo" | "email" | "employer", Visibility>;
  consents: { directory: boolean; photo: boolean; birthday: boolean; contact: boolean; accuracy: boolean };
};

const initial: Draft = {
  email: "",
  fullName: "",
  fullNameTa: "",
  nickname: "",
  gender: "undisclosed",
  dateOfBirth: "",
  schoolId: SCHOOLS[0]?.id ?? "",
  alStream: "OTHER",
  admissionNo: "",
  city: "",
  country: "",
  address: "",
  mobile: "",
  whatsapp: "",
  profession: "",
  employer: "",
  jobTitle: "",
  maritalStatus: "undisclosed",
  spouseName: "",
  children: "",
  about: "",
  facebook: "",
  linkedin: "",
  instagram: "",
  website: "",
  photoKey: "",
  visibility: {
    mobile: "ADMINS_ONLY",
    whatsapp: "ADMINS_ONLY",
    address: "ADMINS_ONLY",
    spouseName: "ADMINS_ONLY",
    children: "ADMINS_ONLY",
    admissionNo: "ADMINS_ONLY",
    email: "ADMINS_ONLY",
    employer: "ADMINS_ONLY",
  },
  consents: { directory: false, photo: false, birthday: false, contact: false, accuracy: false },
};

export function JoinForm() {
  const t = useTranslations("join");
  const common = useTranslations("common");
  const home = useTranslations("home");
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(initial);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [company, setCompany] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    const saved = window.localStorage.getItem(DRAFT_KEY);
    if (!saved) return;
    try {
      setDraft({ ...initial, ...JSON.parse(saved) });
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    if (!siteKey) return;
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => {
      const turnstile = (window as unknown as { turnstile?: { render: (el: string, opts: object) => void } }).turnstile;
      turnstile?.render("#turnstile", {
        sitekey: siteKey,
        callback: (token: string) => setTurnstileToken(token),
      });
    };
    document.body.appendChild(script);
    return () => script.remove();
  }, [siteKey]);

  const steps = useMemo(() => STEPS.map((key) => t(`steps.${key}`)), [t]);

  function patch(partial: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...partial }));
  }

  async function upload(file: File) {
    setError("");
    const presign = await fetch("/api/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: file.type, contentLength: file.size }),
    });
    const target = (await presign.json()) as { uploadUrl?: string; key?: string; error?: string; headers?: Record<string, string> };
    if (!presign.ok || !target.uploadUrl || !target.key) {
      setError(target.error ?? common("error"));
      return;
    }
    const uploaded = await fetch(target.uploadUrl, { method: "PUT", headers: target.headers, body: file });
    if (!uploaded.ok) {
      setError(common("error"));
      return;
    }
    const processed = await fetch("/api/upload/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: target.key }),
    });
    const result = (await processed.json()) as { photoKey?: string; error?: string };
    if (!processed.ok || !result.photoKey) {
      setError(result.error ?? common("error"));
      return;
    }
    patch({ photoKey: result.photoKey });
  }

  async function submit() {
    setBusy(true);
    setError("");
    const result = await submitJoin({
      ...draft,
      password,
      confirmPassword,
      company,
      turnstileToken,
      consents: { ...draft.consents, noticeVersion: CONSENT_NOTICE_VERSION },
    });
    setBusy(false);
    if (result && "ok" in result && result.ok) {
      window.localStorage.removeItem(DRAFT_KEY);
      router.push("/thank-you");
      return;
    }
    setError(("error" in (result ?? {}) && result?.error) || common("error"));
  }

  return (
    <GlassCard>
      <h2 className="mb-4 text-2xl font-semibold">{home("formTitle")}</h2>
      <StepWizard
        steps={steps}
        index={step}
        backLabel={common("back")}
        nextLabel={common("next")}
        submitLabel={common("submit")}
        isLast={step === STEPS.length - 1}
        busy={busy}
        onBack={() => setStep((value) => Math.max(0, value - 1))}
        onNext={() => {
          if (!stepReady(step, draft, password, confirmPassword)) {
            setError(common("error"));
            return;
          }
          setError("");
          if (step === STEPS.length - 1) void submit();
          else setStep((value) => value + 1);
        }}
      >
        {step === 0 ? (
          <div className="grid gap-3">
            <Field label={t("email")}><input className="field" type="email" value={draft.email} onChange={(event) => patch({ email: event.target.value })} /></Field>
            <Field label={t("password")}><input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" /></Field>
            <Field label={t("confirmPassword")}><input className="field" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" /></Field>
          </div>
        ) : null}
        {step === 1 ? (
          <div className="grid gap-3">
            <Field label={t("fullName")}><input className="field" value={draft.fullName} onChange={(event) => patch({ fullName: event.target.value })} /></Field>
            <Field label={t("fullNameTa")}><input className="field" value={draft.fullNameTa} onChange={(event) => patch({ fullNameTa: event.target.value })} /></Field>
            <Field label={t("nickname")}><input className="field" value={draft.nickname} onChange={(event) => patch({ nickname: event.target.value })} /></Field>
          </div>
        ) : null}
        {step === 2 ? (
          <div className="grid gap-3">
            <Field label={t("school")}>
              <select className="field" value={draft.schoolId} onChange={(event) => patch({ schoolId: event.target.value })}>
                {SCHOOLS.map((school) => (
                  <option key={school.id} value={school.id}>{school.nameEn} — {school.nameTa}</option>
                ))}
              </select>
            </Field>
            <Field label={t("stream")}>
              <select className="field" value={draft.alStream} onChange={(event) => patch({ alStream: event.target.value as Draft["alStream"] })}>
                {(["MATHS", "BIO", "COMMERCE", "ARTS", "TECHNOLOGY", "OTHER"] as const).map((stream) => (
                  <option key={stream} value={stream}>{t(`streams.${stream}`)}</option>
                ))}
              </select>
            </Field>
            <VisibilityField label={t("admissionNo")} value={draft.visibility.admissionNo} members={t("visibilityMembers")} admins={t("visibilityAdmins")} onChange={(visibility) => patch({ visibility: { ...draft.visibility, admissionNo: visibility } })}>
              <input className="field" value={draft.admissionNo} onChange={(event) => patch({ admissionNo: event.target.value })} />
            </VisibilityField>
          </div>
        ) : null}
        {step === 3 ? (
          <div className="grid gap-3">
            <Field label={t("gender")}>
              <select className="field" value={draft.gender} onChange={(event) => patch({ gender: event.target.value as Draft["gender"] })}>
                <option value="female">{t("female")}</option>
                <option value="male">{t("male")}</option>
                <option value="undisclosed">{t("undisclosed")}</option>
              </select>
            </Field>
            <Field label={t("dateOfBirth")}><input className="field" type="date" value={draft.dateOfBirth} onChange={(event) => patch({ dateOfBirth: event.target.value })} /></Field>
            <Field label={t("photo")}>
              <input className="field" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
              }} />
              <span className="text-xs text-[var(--muted)]">{t("photoHint")}</span>
              {draft.photoKey ? <span className="text-xs text-teal">{draft.photoKey}</span> : null}
            </Field>
          </div>
        ) : null}
        {step === 4 ? (
          <div className="grid gap-3">
            <Field label={t("country")}><input className="field" value={draft.country} onChange={(event) => patch({ country: event.target.value })} /></Field>
            <Field label={t("city")}><input className="field" value={draft.city} onChange={(event) => patch({ city: event.target.value })} /></Field>
            <VisibilityField label={t("address")} value={draft.visibility.address} members={t("visibilityMembers")} admins={t("visibilityAdmins")} onChange={(visibility) => patch({ visibility: { ...draft.visibility, address: visibility } })}>
              <input className="field" value={draft.address} onChange={(event) => patch({ address: event.target.value })} />
            </VisibilityField>
          </div>
        ) : null}
        {step === 5 ? (
          <div className="grid gap-3">
            <VisibilityField label={t("mobile")} value={draft.visibility.mobile} members={t("visibilityMembers")} admins={t("visibilityAdmins")} onChange={(visibility) => patch({ visibility: { ...draft.visibility, mobile: visibility } })}>
              <input className="field" value={draft.mobile} onChange={(event) => patch({ mobile: event.target.value })} />
            </VisibilityField>
            <VisibilityField label={t("whatsapp")} value={draft.visibility.whatsapp} members={t("visibilityMembers")} admins={t("visibilityAdmins")} onChange={(visibility) => patch({ visibility: { ...draft.visibility, whatsapp: visibility } })}>
              <input className="field" value={draft.whatsapp} onChange={(event) => patch({ whatsapp: event.target.value })} />
            </VisibilityField>
            <VisibilityField label={t("email")} value={draft.visibility.email} members={t("visibilityMembers")} admins={t("visibilityAdmins")} onChange={(visibility) => patch({ visibility: { ...draft.visibility, email: visibility } })}>
              <input className="field" value={draft.email} readOnly />
            </VisibilityField>
          </div>
        ) : null}
        {step === 6 ? (
          <div className="grid gap-3">
            <Field label={t("profession")}><input className="field" value={draft.profession} onChange={(event) => patch({ profession: event.target.value })} /></Field>
            <VisibilityField label={t("employer")} value={draft.visibility.employer} members={t("visibilityMembers")} admins={t("visibilityAdmins")} onChange={(visibility) => patch({ visibility: { ...draft.visibility, employer: visibility } })}>
              <input className="field" value={draft.employer} onChange={(event) => patch({ employer: event.target.value })} />
            </VisibilityField>
            <Field label={t("jobTitle")}><input className="field" value={draft.jobTitle} onChange={(event) => patch({ jobTitle: event.target.value })} /></Field>
          </div>
        ) : null}
        {step === 7 ? (
          <div className="grid gap-3">
            <Field label={t("maritalStatus")}>
              <select className="field" value={draft.maritalStatus} onChange={(event) => patch({ maritalStatus: event.target.value as Draft["maritalStatus"] })}>
                <option value="single">{t("single")}</option>
                <option value="married">{t("married")}</option>
                <option value="other">{t("other")}</option>
                <option value="undisclosed">{t("undisclosed")}</option>
              </select>
            </Field>
            <VisibilityField label={t("spouseName")} value={draft.visibility.spouseName} members={t("visibilityMembers")} admins={t("visibilityAdmins")} onChange={(visibility) => patch({ visibility: { ...draft.visibility, spouseName: visibility } })}>
              <input className="field" value={draft.spouseName} onChange={(event) => patch({ spouseName: event.target.value })} />
            </VisibilityField>
            <VisibilityField label={t("children")} value={draft.visibility.children} members={t("visibilityMembers")} admins={t("visibilityAdmins")} onChange={(visibility) => patch({ visibility: { ...draft.visibility, children: visibility } })}>
              <textarea className="field" value={draft.children} onChange={(event) => patch({ children: event.target.value })} />
            </VisibilityField>
            <Field label={t("about")}><textarea className="field" value={draft.about} onChange={(event) => patch({ about: event.target.value })} /></Field>
            <Field label={t("facebook")}><input className="field" value={draft.facebook} onChange={(event) => patch({ facebook: event.target.value })} /></Field>
            <Field label={t("linkedin")}><input className="field" value={draft.linkedin} onChange={(event) => patch({ linkedin: event.target.value })} /></Field>
            <Field label={t("instagram")}><input className="field" value={draft.instagram} onChange={(event) => patch({ instagram: event.target.value })} /></Field>
            <Field label={t("website")}><input className="field" value={draft.website} onChange={(event) => patch({ website: event.target.value })} /></Field>
          </div>
        ) : null}
        {step === 8 ? (
          <div className="space-y-3 text-sm">
            <p>{t("consent.intro")}</p>
            <Check label={t("consent.directory")} checked={draft.consents.directory} onChange={(directory) => patch({ consents: { ...draft.consents, directory } })} />
            <Check label={t("consent.photo")} checked={draft.consents.photo} onChange={(photo) => patch({ consents: { ...draft.consents, photo } })} />
            <Check label={t("consent.birthday")} checked={draft.consents.birthday} onChange={(birthday) => patch({ consents: { ...draft.consents, birthday } })} />
            <Check label={t("consent.contact")} checked={draft.consents.contact} onChange={(contact) => patch({ consents: { ...draft.consents, contact } })} />
            <Check label={t("consent.accuracy")} checked={draft.consents.accuracy} onChange={(accuracy) => patch({ consents: { ...draft.consents, accuracy } })} />
            {siteKey ? <div id="turnstile" /> : null}
            <input className="absolute -left-[9999px]" tabIndex={-1} autoComplete="off" aria-hidden value={company} onChange={(event) => setCompany(event.target.value)} placeholder={t("company")} />
          </div>
        ) : null}
        {step === 9 ? (
          <div className="space-y-2 text-sm">
            <p>{t("reviewHint")}</p>
            <p>{draft.fullName} · {draft.email}</p>
            <p>{SCHOOLS.find((school) => school.id === draft.schoolId)?.nameEn}</p>
            <p>{draft.city}, {draft.country} · {draft.profession}</p>
          </div>
        ) : null}
        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      </StepWizard>
    </GlassCard>
  );
}

function stepReady(step: number, draft: Draft, password: string, confirmPassword: string) {
  if (step === 0) return draft.email.includes("@") && password.length >= 10 && password === confirmPassword;
  if (step === 1) return draft.fullName.trim().length >= 2;
  if (step === 2) return Boolean(draft.schoolId);
  if (step === 3) return /^\d{4}-\d{2}-\d{2}$/.test(draft.dateOfBirth);
  if (step === 4) return draft.city.trim().length >= 2 && draft.country.trim().length >= 2;
  if (step === 5) return draft.mobile.trim().length >= 8;
  if (step === 6) return draft.profession.trim().length >= 2;
  if (step === 8) return draft.consents.directory && draft.consents.accuracy && (!draft.photoKey || draft.consents.photo);
  return true;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2 text-sm">
      <span className="text-[var(--muted)]">{label}</span>
      {children}
    </label>
  );
}

function VisibilityField({
  label,
  value,
  members,
  admins,
  onChange,
  children,
}: {
  label: string;
  value: Visibility;
  members: string;
  admins: string;
  onChange: (value: Visibility) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Field label={label}>{children}</Field>
      <div className="flex gap-2">
        <button type="button" className={`min-h-touch rounded-full px-3 text-xs ${value === "MEMBERS" ? "bg-gold text-navy-900" : "border border-[var(--line)]"}`} onClick={() => onChange("MEMBERS")}>{members}</button>
        <button type="button" className={`min-h-touch rounded-full px-3 text-xs ${value === "ADMINS_ONLY" ? "bg-gold text-navy-900" : "border border-[var(--line)]"}`} onClick={() => onChange("ADMINS_ONLY")}>{admins}</button>
      </div>
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex min-h-touch items-start gap-3">
      <input type="checkbox" className="mt-1 h-5 w-5" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
