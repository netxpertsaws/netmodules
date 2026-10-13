import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AlbumCoverflow } from "@/components/3d/AlbumCoverflow";
import { DatabaseNotice } from "@/components/layout/DatabaseNotice";
import { databaseReady, prisma } from "@/lib/prisma";
import { signedPhotoUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function AlbumPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("album");
  if (!(await databaseReady())) return <DatabaseNotice />;
  const albums = await prisma.album.findMany({ where: { status: "PUBLISHED" }, orderBy: { eventDate: "desc" } });
  const items = await Promise.all(
    albums.map(async (album) => ({
      id: album.id,
      title: locale === "ta" ? album.titleTa : album.titleEn,
      href: `/${locale}/album/${album.id}`,
      image: await signedPhotoUrl(album.coverKey),
    })),
  );
  return (
    <div>
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      {items.length ? <AlbumCoverflow items={items} /> : <p className="mt-4 text-[var(--muted)]">{t("empty")}</p>}
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link href={item.href}>{item.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
