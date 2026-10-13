"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveAchievement, saveAlbum, saveEvent, saveMemoriam, saveObituary, addPhoto } from "@/app/actions/content-actions";

type Kind = "event" | "obituary" | "achievement" | "memoriam" | "album";

export function ContentDesk({ kind }: { kind: Kind }) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  return (
    <form
      className="grid gap-3 rounded-xl bg-white p-4 shadow-sm"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const status = String(data.get("status") ?? "PUBLISHED");
        const payload =
          kind === "event"
            ? {
                titleEn: String(data.get("titleEn")),
                titleTa: String(data.get("titleTa")),
                descriptionEn: String(data.get("bodyEn")),
                descriptionTa: String(data.get("bodyTa")),
                startsAt: new Date(String(data.get("startsAt"))).toISOString(),
                endsAt: "",
                location: String(data.get("location") ?? ""),
                status,
              }
            : kind === "obituary"
              ? {
                  nameEn: String(data.get("titleEn")),
                  nameTa: String(data.get("titleTa")),
                  summaryEn: String(data.get("bodyEn")),
                  summaryTa: String(data.get("bodyTa")),
                  passedOn: String(data.get("date")),
                  status,
                }
              : kind === "achievement"
                ? {
                    titleEn: String(data.get("titleEn")),
                    titleTa: String(data.get("titleTa")),
                    bodyEn: String(data.get("bodyEn")),
                    bodyTa: String(data.get("bodyTa")),
                    year: Number(data.get("year")),
                    status,
                  }
                : kind === "memoriam"
                  ? {
                      nameEn: String(data.get("titleEn")),
                      nameTa: String(data.get("titleTa")),
                      tributeEn: String(data.get("bodyEn")),
                      tributeTa: String(data.get("bodyTa")),
                      years: String(data.get("years") ?? ""),
                      status,
                    }
                  : {
                      titleEn: String(data.get("titleEn")),
                      titleTa: String(data.get("titleTa")),
                      eventDate: String(data.get("date") ?? ""),
                      coverKey: String(data.get("coverKey") ?? ""),
                      status,
                    };
        const action = { event: saveEvent, obituary: saveObituary, achievement: saveAchievement, memoriam: saveMemoriam, album: saveAlbum }[kind];
        const result = await action(payload);
        setMessage(result && "ok" in result ? "Saved" : result?.error ?? "Failed");
        router.refresh();
      }}
    >
      <input className="rounded border px-3 py-2" name="titleEn" placeholder="Title (English)" required />
      <input className="rounded border px-3 py-2" name="titleTa" placeholder="Title (Tamil)" required />
      {kind !== "album" ? (
        <>
          <textarea className="rounded border px-3 py-2" name="bodyEn" placeholder="English text" required />
          <textarea className="rounded border px-3 py-2" name="bodyTa" placeholder="Tamil text" required />
        </>
      ) : null}
      {kind === "event" ? <input className="rounded border px-3 py-2" name="startsAt" type="datetime-local" required /> : null}
      {kind === "event" ? <input className="rounded border px-3 py-2" name="location" placeholder="Location" /> : null}
      {kind === "obituary" || kind === "album" ? <input className="rounded border px-3 py-2" name="date" type="date" required={kind === "obituary"} /> : null}
      {kind === "achievement" ? <input className="rounded border px-3 py-2" name="year" type="number" defaultValue={new Date().getFullYear()} required /> : null}
      {kind === "memoriam" ? <input className="rounded border px-3 py-2" name="years" placeholder="Years" /> : null}
      {kind === "album" ? <input className="rounded border px-3 py-2" name="coverKey" placeholder="Cover photo key" /> : null}
      <select className="rounded border px-3 py-2" name="status" defaultValue="PUBLISHED">
        <option>DRAFT</option>
        <option>PUBLISHED</option>
        <option>ARCHIVED</option>
      </select>
      <button className="rounded bg-[#13244D] px-4 py-2 text-white" type="submit">Save</button>
      {message ? <p className="text-sm">{message}</p> : null}
    </form>
  );
}

export function PhotoAdder({ albumId }: { albumId: string }) {
  const router = useRouter();
  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        await addPhoto({
          albumId,
          key: String(data.get("key") ?? ""),
          captionEn: String(data.get("captionEn") ?? ""),
          captionTa: String(data.get("captionTa") ?? ""),
        });
        router.refresh();
      }}
    >
      <input className="rounded border px-2 py-1 text-sm" name="key" placeholder="photos/…/full.webp" required />
      <input className="rounded border px-2 py-1 text-sm" name="captionEn" placeholder="Caption EN" />
      <input className="rounded border px-2 py-1 text-sm" name="captionTa" placeholder="Caption TA" />
      <button className="rounded border px-2 text-sm" type="submit">Add photo</button>
    </form>
  );
}
