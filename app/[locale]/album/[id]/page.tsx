import { notFound } from "next/navigation";
import { databaseReady, prisma } from "@/lib/prisma";
import { DatabaseNotice } from "@/components/layout/DatabaseNotice";
import { signedPhotoUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function AlbumDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  if (!(await databaseReady())) return <DatabaseNotice />;
  const album = await prisma.album.findFirst({ where: { id, status: "PUBLISHED" }, include: { photos: true } });
  if (!album) notFound();
  const photos = await Promise.all(album.photos.map(async (photo) => ({ ...photo, url: await signedPhotoUrl(photo.key) })));
  return (
    <div>
      <h1 className="text-3xl font-semibold">{locale === "ta" ? album.titleTa : album.titleEn}</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {photos.map((photo) => (
          <figure key={photo.id} className="glass overflow-hidden">
            {photo.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo.url} alt="" className="h-64 w-full object-cover" />
            ) : null}
            <figcaption className="p-3 text-sm">{locale === "ta" ? photo.captionTa : photo.captionEn}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
