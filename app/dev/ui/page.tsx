import { notFound } from "next/navigation";
import { AlbumCoverflow } from "@/components/3d/AlbumCoverflow";
import { HeroStage } from "@/components/3d/HeroStage";
import { MemberCard3D } from "@/components/3d/MemberCard3D";
import { TrophyShelf } from "@/components/3d/TrophyShelf";
import { BirthdayCard3D } from "@/components/3d/BirthdayCard3D";
import { BottomNav } from "@/components/ui/BottomNav";
import { EventDateBlock } from "@/components/ui/EventDateBlock";
import { GlassCard } from "@/components/ui/GlassCard";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { MemorialPanel } from "@/components/ui/MemorialPanel";
import { ShowcaseWizard } from "@/components/dev/StaticWizard";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { TiltCard } from "@/components/ui/TiltCard";

export const dynamic = "force-dynamic";

export default function DevUiPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 pb-28">
      <h1 className="text-3xl font-semibold">UI showcase</h1>
      <div className="flex gap-2"><LanguageSwitcher locale="en" /><ThemeToggle /></div>
      <HeroStage kicker="O/L 1995 · A/L 1998" title="Vada reunion" subtitle="Static and 3D hero." cta="Join" />
      <GlassCard>Glass card</GlassCard>
      <TiltCard><GlassCard>Tilt card</GlassCard></TiltCard>
      <MemberCard3D href="/dev/ui" name="Asha N" nickname="Ash" school="Hartley College" place="Toronto, Canada" identityNo="VADA-001" />
      <BirthdayCard3D userId="demo" name="Asha" school="Hartley College" localDate="2026-10-13" />
      <AlbumCoverflow items={[{ id: "1", title: "Reunion", href: "/dev/ui" }, { id: "2", title: "Batch", href: "/dev/ui" }]} />
      <TrophyShelf labels={["Maths prize", "Service", "Batch"]} />
      <EventDateBlock iso="2027-04-10T14:00:00.000Z" timeZone="Asia/Colombo" title="Toronto reunion" location="Toronto" />
      <ShowcaseWizard />
      <MemorialPanel eyebrow="In memoriam" title="A quiet name" body="Obituaries stay calm: no tilt, no confetti." meta="1998" />
      <BottomNav locale="en" />
    </main>
  );
}
