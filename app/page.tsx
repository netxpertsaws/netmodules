import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { HeroStage } from "@/components/3d/HeroStage";
import { JoinForm } from "@/components/forms/JoinForm";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { SCHOOLS } from "@/lib/schools";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const t = await getTranslations("home");
  const brand = await getTranslations("brand");
  const session = await auth();
  const signedInHref =
    session?.user?.status === "APPROVED"
      ? session.user.role === "MEMBER"
        ? `/${session.user.locale === "ta" ? "ta" : "en"}/home`
        : "/admin"
      : null;
  return (
    <main>
      <SiteHeader signedInHref={signedInHref} />
      <HeroStage kicker={brand("kicker")} title={t("title")} subtitle={t("subtitle")} cta={t("cta")} />
      <section className="mx-auto max-w-6xl px-4 pb-8">
        <h2 className="mb-4 text-xl font-semibold">{t("schools")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SCHOOLS.map((school) => (
            <GlassCard key={school.id} className="p-4">
              <p className="text-xs text-gold">{school.placeEn}</p>
              <p className="font-medium">{school.nameEn}</p>
              <p className="text-sm text-[var(--muted)]">{school.nameTa}</p>
            </GlassCard>
          ))}
        </div>
      </section>
      <section id="join" className="mx-auto max-w-3xl px-4 pb-20">
        <JoinForm />
      </section>
    </main>
  );
}
