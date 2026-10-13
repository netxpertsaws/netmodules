import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { ChangeRequestDialog } from "@/components/members/ChangeRequestDialog";
import { DatabaseNotice } from "@/components/layout/DatabaseNotice";
import { GlassCard } from "@/components/ui/GlassCard";
import { databaseReady } from "@/lib/prisma";
import { loadViewerProfile } from "@/lib/profile-data";

export const dynamic = "force-dynamic";

export default async function OwnProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("profile");
  if (!(await databaseReady())) return <DatabaseNotice />;
  const session = await auth();
  if (!session?.user.identityNo) {
    return (
      <GlassCard>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-3 text-[var(--muted)]">{t("readOnly")}</p>
      </GlassCard>
    );
  }
  const profile = await loadViewerProfile(session.user.identityNo, session.user.role);
  if (!profile) redirect(`/${locale}/home`);
  const name = locale === "ta" && profile.fullNameTa ? profile.fullNameTa : profile.fullName;
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <p className="text-sm text-[var(--muted)]">{t("readOnly")}</p>
      <GlassCard>
        <p className="text-gold">{profile.identityNo}</p>
        <h2 className="text-2xl font-semibold">{name}</h2>
        <p>{locale === "ta" ? profile.schoolNameTa : profile.schoolNameEn}</p>
        <p className="text-[var(--muted)]">{profile.profession}</p>
        <p className="mt-3 whitespace-pre-wrap">{profile.about}</p>
      </GlassCard>
      {session.user.role === "MEMBER" && profile.status !== "DECEASED" ? <ChangeRequestDialog /> : null}
    </div>
  );
}
