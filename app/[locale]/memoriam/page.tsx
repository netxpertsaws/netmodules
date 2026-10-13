import { getTranslations } from "next-intl/server";
import { MemorialPanel } from "@/components/ui/MemorialPanel";
import { DatabaseNotice } from "@/components/layout/DatabaseNotice";
import { databaseReady, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MemoriamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  if (!(await databaseReady())) return <DatabaseNotice />;
  const rows = await prisma.memoriam.findMany({ where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl">{t("sections.memoriam")}</h1>
      {rows.length ? (
        rows.map((row) => (
          <MemorialPanel
            key={row.id}
            eyebrow={t("memorial.memoriam")}
            title={locale === "ta" ? row.nameTa : row.nameEn}
            body={locale === "ta" ? row.tributeTa : row.tributeEn}
            meta={row.years ?? undefined}
          />
        ))
      ) : (
        <p>{t("common.empty")}</p>
      )}
    </div>
  );
}
