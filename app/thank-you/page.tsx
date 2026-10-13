import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const dynamic = "force-dynamic";

export default async function ThankYouPage() {
  const t = await getTranslations("thankYou");
  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-xl px-4 py-16">
        <GlassCard>
          <h1 className="text-3xl font-semibold">{t("title")}</h1>
          <p className="mt-4 text-[var(--muted)]">{t("body")}</p>
        </GlassCard>
      </section>
    </main>
  );
}
