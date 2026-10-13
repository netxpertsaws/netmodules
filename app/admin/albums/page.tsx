import { ContentDesk, PhotoAdder } from "@/components/admin/ContentDesk";
import { DatabaseNotice } from "@/components/layout/DatabaseNotice";
import { databaseReady, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAlbumsPage() {
  if (!(await databaseReady())) return <DatabaseNotice />;
  const rows = await prisma.album.findMany({ include: { photos: true }, orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Albums</h1>
      <ContentDesk kind="album" />
      {rows.map((row) => (
        <article key={row.id} className="rounded bg-white p-3 text-sm">
          <p className="font-medium">{row.titleEn} · {row.photos.length} photos</p>
          <PhotoAdder albumId={row.id} />
        </article>
      ))}
    </div>
  );
}
