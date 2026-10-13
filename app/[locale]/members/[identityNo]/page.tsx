import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { GlassCard } from "@/components/ui/GlassCard";
import { MemorialPanel } from "@/components/ui/MemorialPanel";
import { TiltCard } from "@/components/ui/TiltCard";
import { DatabaseNotice } from "@/components/layout/DatabaseNotice";
import { ProfileViewLogger } from "@/components/members/ProfileViewLogger";
import { databaseReady } from "@/lib/prisma";
import { loadViewerProfile } from "@/lib/profile-data";
import { initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ locale: string; identityNo: string }>;
}) {
  const { locale, identityNo } = await params;
  const t = await getTranslations("profile");
  const streams = await getTranslations("join.streams");
  if (!(await databaseReady())) return <DatabaseNotice />;
  const session = await auth();
  const profile = await loadViewerProfile(identityNo, session?.user.role ?? "MEMBER");
  if (!profile) notFound();
  const name = locale === "ta" && profile.fullNameTa ? profile.fullNameTa : profile.fullName;
  const school = locale === "ta" ? profile.schoolNameTa : profile.schoolNameEn;
  const deceased = profile.status === "DECEASED";

  return (
    <div className="space-y-5">
      <ProfileViewLogger identityNo={identityNo} />
      {deceased ? (
        <MemorialPanel eyebrow={t("deceased")} title={name} body={profile.about ?? ""} meta={profile.identityNo ?? undefined} />
      ) : (
        <TiltCard>
          <div className="glass overflow-hidden">
            <div className="relative h-72 bg-gradient-to-b from-white/10 to-transparent">
              {profile.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.photoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-5xl text-gold">{initials(name)}</div>
              )}
            </div>
            <div className="p-6">
              <p className="text-gold">{profile.identityNo}</p>
              <h1 className="text-4xl font-semibold">{name}</h1>
              {profile.nickname ? <p className="text-[var(--muted)]">{profile.nickname}</p> : null}
            </div>
          </div>
        </TiltCard>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard>
          <h2 className="text-lg font-semibold">{t("school")}</h2>
          <p className="mt-2">{school}</p>
          <p className="text-sm text-[var(--muted)]">{profile.alStream ? streams(profile.alStream as "MATHS") : ""}</p>
        </GlassCard>
        <GlassCard>
          <h2 className="text-lg font-semibold">{t("work")}</h2>
          <p className="mt-2">{profile.profession}</p>
          <p className="text-sm text-[var(--muted)]">{[profile.jobTitle, profile.employer].filter(Boolean).join(" · ")}</p>
          <p className="text-sm text-[var(--muted)]">{[profile.city, profile.country].filter(Boolean).join(", ")}</p>
        </GlassCard>
        {profile.about ? (
          <GlassCard>
            <h2 className="text-lg font-semibold">{t("about")}</h2>
            <p className="mt-2 whitespace-pre-wrap">{profile.about}</p>
          </GlassCard>
        ) : null}
        {profile.mobile || profile.email || profile.whatsapp ? (
          <GlassCard>
            <h2 className="text-lg font-semibold">{t("contact")}</h2>
            <p className="mt-2">{profile.mobile}</p>
            <p>{profile.whatsapp}</p>
            <p>{profile.email}</p>
          </GlassCard>
        ) : null}
      </div>
    </div>
  );
}
