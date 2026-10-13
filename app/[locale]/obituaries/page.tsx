import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MemorialPanel } from "@/components/ui/MemorialPanel";
import { DatabaseNotice } from "@/components/layout/DatabaseNotice";
import { databaseReady, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ObituariesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  if (!(await databaseReady())) return <DatabaseNotice />;
  const rows = await prisma.obituary.findMany({ where: { status: "PUBLISHED" }, orderBy: { passedOn: "desc" } });
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl">{t("sections.obituaries")}</h1>
      {rows.length ? (
        rows.map((row) => (
          <Link key={row.id} href={`/${locale}/obituaries/${row.id}`} className="block">
            <MemorialPanel
              eyebrow={t("memorial.obituary")}
              title={locale === "ta" ? row.nameTa : row.nameEn}
              body={locale === "ta" ? row.summaryTa : row.summaryEn}
              meta={row.passedOn.toISOString().slice(0, 10)}
            />
          </Link>
        ))
      ) : (
        <p>{t("common.empty")}</p>
      )}
    </div>
  );
}
