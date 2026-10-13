import Link from "next/link";
import { TiltCard } from "@/components/ui/TiltCard";
import { initials } from "@/lib/utils";

export function MemberCard3D({
  href,
  name,
  nickname,
  school,
  place,
  identityNo,
  photoUrl,
  calm,
  memoriamLabel,
}: {
  href: string;
  name: string;
  nickname?: string | null;
  school?: string | null;
  place?: string | null;
  identityNo?: string | null;
  photoUrl?: string | null;
  calm?: boolean;
  memoriamLabel?: string;
}) {
  const card = (
    <article className={`glass h-full overflow-hidden ${calm ? "memorial" : ""}`}>
      <div className="relative h-40 bg-gradient-to-br from-navy-800 to-navy-950">
        {photoUrl ? (
          // Signed URLs expire and must not be cached by the image optimizer.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl text-gold">{initials(name)}</div>
        )}
      </div>
      <div className="space-y-1 p-4">
        <p className="text-xs text-gold">{identityNo}</p>
        <h3 className="text-lg font-semibold">{name}</h3>
        {nickname ? <p className="text-sm text-[var(--muted)]">{nickname}</p> : null}
        <p className="text-sm">{school}</p>
        <p className="text-sm text-[var(--muted)]">{place}</p>
        {calm && memoriamLabel ? <p className="text-xs tracking-widest text-neutral-400">{memoriamLabel}</p> : null}
      </div>
    </article>
  );
  return (
    <Link href={href} className="block h-full">
      {calm ? card : <TiltCard className="h-full">{card}</TiltCard>}
    </Link>
  );
}
