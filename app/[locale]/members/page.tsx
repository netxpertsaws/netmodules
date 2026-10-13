import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { MemberCard3D } from "@/components/3d/MemberCard3D";
import { DatabaseNotice } from "@/components/layout/DatabaseNotice";
import { databaseReady } from "@/lib/prisma";
import { SCHOOLS } from "@/lib/schools";
import { searchDirectory } from "@/lib/profile-data";

export const dynamic = "force-dynamic";

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function MembersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const t = await getTranslations("members");
  const common = await getTranslations("common");
  const streams = await getTranslations("join.streams");
  if (!(await databaseReady())) return <DatabaseNotice />;
  const session = await auth();
  const role = session?.user.role ?? "MEMBER";
  const page = Number(one(query.page) ?? "1") || 1;
  const result = await searchDirectory({
    q: one(query.q),
    schoolId: one(query.schoolId),
    country: one(query.country),
    city: one(query.city),
    profession: one(query.profession),
    alStream: one(query.alStream),
    page,
    role,
  });
  const base = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    const item = one(value);
    if (item && key !== "page") base.set(key, item);
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <form className="mt-4 grid gap-3 md:grid-cols-3">
        <input className="field" name="q" placeholder={t("search")} defaultValue={one(query.q) ?? ""} />
        <select className="field" name="schoolId" defaultValue={one(query.schoolId) ?? ""}>
          <option value="">{t("school")}</option>
          {SCHOOLS.map((school) => (
            <option key={school.id} value={school.id}>
              {locale === "ta" ? school.nameTa : school.nameEn}
            </option>
          ))}
        </select>
        <select className="field" name="alStream" defaultValue={one(query.alStream) ?? ""}>
          <option value="">{t("stream")}</option>
          {(["MATHS", "BIO", "COMMERCE", "ARTS", "TECHNOLOGY", "OTHER"] as const).map((stream) => (
            <option key={stream} value={stream}>
              {streams(stream)}
            </option>
          ))}
        </select>
        <input className="field" name="country" placeholder={t("country")} defaultValue={one(query.country) ?? ""} />
        <input className="field" name="city" placeholder={t("city")} defaultValue={one(query.city) ?? ""} />
        <input className="field" name="profession" placeholder={t("profession")} defaultValue={one(query.profession) ?? ""} />
        <button className="min-h-touch rounded-full bg-gold px-5 font-semibold text-navy-900" type="submit">
          {t("search")}
        </button>
      </form>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.members.map((member) => (
          <MemberCard3D
            key={member.identityNo ?? member.fullName}
            href={`/${locale}/members/${member.identityNo}`}
            name={locale === "ta" && member.fullNameTa ? member.fullNameTa : member.fullName}
            nickname={member.nickname}
            school={locale === "ta" ? member.schoolNameTa : member.schoolNameEn}
            place={[member.city, member.country].filter(Boolean).join(", ")}
            identityNo={member.identityNo}
            photoUrl={member.thumbUrl ?? member.photoUrl}
            calm={member.status === "DECEASED"}
            memoriamLabel={t("inMemoriam")}
          />
        ))}
      </div>
      {!result.members.length ? <p className="mt-6 text-[var(--muted)]">{common("empty")}</p> : null}
      <div className="mt-6 flex gap-3">
        {page > 1 ? (
          <Link className="min-h-touch inline-flex items-center rounded-full border border-[var(--line)] px-4" href={`/${locale}/members?${new URLSearchParams({ ...Object.fromEntries(base), page: String(page - 1) })}`}>
            {t("previous")}
          </Link>
        ) : null}
        {page < result.pages ? (
          <Link className="min-h-touch inline-flex items-center rounded-full border border-[var(--line)] px-4" href={`/${locale}/members?${new URLSearchParams({ ...Object.fromEntries(base), page: String(page + 1) })}`}>
            {t("next")}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
