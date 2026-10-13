import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MemorialPanel } from "@/components/ui/MemorialPanel";
import { CondolenceForm } from "@/components/members/CondolenceForm";
import { DatabaseNotice } from "@/components/layout/DatabaseNotice";
import { databaseReady, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ObituaryPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const t = await getTranslations("memorial");
  if (!(await databaseReady())) return <DatabaseNotice />;
  const row = await prisma.obituary.findFirst({
    where: { id, status: "PUBLISHED" },
    include: { condolences: { include: { user: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!row) notFound();
  return (
    <div className="space-y-4">
      <MemorialPanel
        eyebrow={t("obituary")}
        title={locale === "ta" ? row.nameTa : row.nameEn}
        body={locale === "ta" ? row.summaryTa : row.summaryEn}
        meta={row.passedOn.toISOString().slice(0, 10)}
      />
      <ul className="space-y-2">
        {row.condolences.map((note) => (
          <li key={note.id} className="memorial px-4 py-3 text-sm">
            <p>{note.message}</p>
            <p className="mt-1 text-neutral-400">{note.user.name}</p>
          </li>
        ))}
      </ul>
      <CondolenceForm obituaryId={row.id} />
    </div>
  );
}
