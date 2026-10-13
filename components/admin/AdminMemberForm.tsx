"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SCHOOLS } from "@/lib/schools";
import { createMember, updateMember } from "@/app/actions/member-actions";

type Initial = {
  userId?: string;
  email?: string;
  fullName?: string;
  fullNameTa?: string;
  nickname?: string;
  gender?: string;
  dateOfBirth?: string;
  schoolId?: string;
  alStream?: string;
  admissionNo?: string;
  city?: string;
  country?: string;
  address?: string;
  mobile?: string;
  whatsapp?: string;
  profession?: string;
  employer?: string;
  jobTitle?: string;
  maritalStatus?: string;
  spouseName?: string;
  children?: string;
  about?: string;
  facebook?: string;
  linkedin?: string;
  instagram?: string;
  website?: string;
  photoKey?: string;
};

const streams = ["MATHS", "BIO", "COMMERCE", "ARTS", "TECHNOLOGY", "OTHER"] as const;

export function AdminMemberForm({ mode, initial }: { mode: "create" | "edit"; initial?: Initial }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="grid gap-3 rounded-xl bg-white p-4 shadow-sm md:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        const data = new FormData(event.currentTarget);
        const visibility = {
          mobile: String(data.get("vis_mobile")),
          whatsapp: String(data.get("vis_whatsapp")),
          address: String(data.get("vis_address")),
          spouseName: String(data.get("vis_spouseName")),
          children: String(data.get("vis_children")),
          admissionNo: String(data.get("vis_admissionNo")),
          email: String(data.get("vis_email")),
          employer: String(data.get("vis_employer")),
        };
        const payload = {
          userId: initial?.userId,
          email: String(data.get("email") ?? ""),
          fullName: String(data.get("fullName") ?? ""),
          fullNameTa: String(data.get("fullNameTa") ?? ""),
          nickname: String(data.get("nickname") ?? ""),
          gender: String(data.get("gender") ?? "undisclosed"),
          dateOfBirth: String(data.get("dateOfBirth") ?? ""),
          schoolId: String(data.get("schoolId") ?? ""),
          alStream: String(data.get("alStream") ?? "OTHER"),
          admissionNo: String(data.get("admissionNo") ?? ""),
          city: String(data.get("city") ?? ""),
          country: String(data.get("country") ?? ""),
          address: String(data.get("address") ?? ""),
          mobile: String(data.get("mobile") ?? ""),
          whatsapp: String(data.get("whatsapp") ?? ""),
          profession: String(data.get("profession") ?? ""),
          employer: String(data.get("employer") ?? ""),
          jobTitle: String(data.get("jobTitle") ?? ""),
          maritalStatus: String(data.get("maritalStatus") ?? "undisclosed"),
          spouseName: String(data.get("spouseName") ?? ""),
          children: String(data.get("children") ?? ""),
          about: String(data.get("about") ?? ""),
          facebook: String(data.get("facebook") ?? ""),
          linkedin: String(data.get("linkedin") ?? ""),
          instagram: String(data.get("instagram") ?? ""),
          website: String(data.get("website") ?? ""),
          photoKey: String(data.get("photoKey") ?? ""),
          visibility,
        };
        const result = mode === "create" ? await createMember(payload) : await updateMember(payload);
        setBusy(false);
        if (result && "ok" in result) {
          router.push("/admin/members");
          router.refresh();
          return;
        }
        setError(result && "error" in result ? String(result.error) : "Check the form");
      }}
    >
      <Field name="email" label="Email" defaultValue={initial?.email} />
      <Field name="fullName" label="Full name" defaultValue={initial?.fullName} />
      <Field name="fullNameTa" label="Name in Tamil" defaultValue={initial?.fullNameTa} />
      <Field name="nickname" label="Nickname" defaultValue={initial?.nickname} />
      <label className="text-sm">Gender
        <select className="mt-1 w-full rounded-lg border px-3 py-2" name="gender" defaultValue={initial?.gender ?? "undisclosed"}>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="undisclosed">Undisclosed</option>
        </select>
      </label>
      <Field name="dateOfBirth" label="Date of birth" type="date" defaultValue={initial?.dateOfBirth} />
      <label className="text-sm">School
        <select className="mt-1 w-full rounded-lg border px-3 py-2" name="schoolId" defaultValue={initial?.schoolId ?? SCHOOLS[0]?.id}>
          {SCHOOLS.map((school) => (
            <option key={school.id} value={school.id}>{school.nameEn}</option>
          ))}
        </select>
      </label>
      <label className="text-sm">A/L stream
        <select className="mt-1 w-full rounded-lg border px-3 py-2" name="alStream" defaultValue={initial?.alStream ?? "OTHER"}>
          {streams.map((stream) => (
            <option key={stream} value={stream}>{stream}</option>
          ))}
        </select>
      </label>
      <Vis name="admissionNo" label="Admission number" defaultValue={initial?.admissionNo} />
      <Field name="city" label="City" defaultValue={initial?.city} />
      <Field name="country" label="Country" defaultValue={initial?.country} />
      <Vis name="address" label="Address" defaultValue={initial?.address} />
      <Vis name="mobile" label="Mobile" defaultValue={initial?.mobile} />
      <Vis name="whatsapp" label="WhatsApp" defaultValue={initial?.whatsapp} />
      <Vis name="email" label="Email visibility" hideInput />
      <Field name="profession" label="Profession" defaultValue={initial?.profession} />
      <Vis name="employer" label="Employer" defaultValue={initial?.employer} />
      <Field name="jobTitle" label="Job title" defaultValue={initial?.jobTitle} />
      <label className="text-sm">Marital status
        <select className="mt-1 w-full rounded-lg border px-3 py-2" name="maritalStatus" defaultValue={initial?.maritalStatus ?? "undisclosed"}>
          <option value="single">Single</option>
          <option value="married">Married</option>
          <option value="other">Other</option>
          <option value="undisclosed">Undisclosed</option>
        </select>
      </label>
      <Vis name="spouseName" label="Spouse" defaultValue={initial?.spouseName} />
      <Vis name="children" label="Children" defaultValue={initial?.children} />
      <Field name="about" label="About" defaultValue={initial?.about} />
      <Field name="facebook" label="Facebook" defaultValue={initial?.facebook} />
      <Field name="linkedin" label="LinkedIn" defaultValue={initial?.linkedin} />
      <Field name="instagram" label="Instagram" defaultValue={initial?.instagram} />
      <Field name="website" label="Website" defaultValue={initial?.website} />
      <Field name="photoKey" label="Photo key" defaultValue={initial?.photoKey} />
      {error ? <p className="text-sm text-red-700 md:col-span-2">{error}</p> : null}
      <button className="min-h-11 rounded-lg bg-[#13244D] px-4 text-white disabled:opacity-60 md:col-span-2" disabled={busy} type="submit">
        {mode === "create" ? "Create and send invite" : "Save member"}
      </button>
    </form>
  );
}

function Field({ name, label, defaultValue, type = "text" }: { name: string; label: string; defaultValue?: string; type?: string }) {
  return (
    <label className="text-sm">
      {label}
      <input className="mt-1 w-full rounded-lg border px-3 py-2" name={name} type={type} defaultValue={defaultValue ?? ""} />
    </label>
  );
}

function Vis({ name, label, defaultValue, hideInput }: { name: string; label: string; defaultValue?: string; hideInput?: boolean }) {
  return (
    <div className="text-sm">
      {hideInput ? null : <Field name={name} label={label} defaultValue={defaultValue} />}
      <label className="mt-1 block text-xs text-slate-500">
        Visibility
        <select className="mt-1 w-full rounded-lg border px-2 py-2" name={`vis_${name}`} defaultValue="ADMINS_ONLY">
          <option value="MEMBERS">All members</option>
          <option value="ADMINS_ONLY">Admins only</option>
        </select>
      </label>
    </div>
  );
}
