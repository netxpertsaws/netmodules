import { notFound } from "next/navigation";
import { AdminMemberForm } from "@/components/admin/AdminMemberForm";
import { databaseReady, prisma } from "@/lib/prisma";
import { DatabaseNotice } from "@/components/layout/DatabaseNotice";

export const dynamic = "force-dynamic";

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await databaseReady())) return <DatabaseNotice />;
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, include: { profile: true } });
  if (!user?.profile) notFound();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Edit {user.identityNo ?? user.email}</h1>
      <AdminMemberForm
        mode="edit"
        initial={{
          userId: user.id,
          email: user.email,
          fullName: user.profile.fullName,
          fullNameTa: user.profile.fullNameTa ?? "",
          nickname: user.profile.nickname ?? "",
          gender: user.profile.gender,
          dateOfBirth: user.profile.dateOfBirth.toISOString().slice(0, 10),
          schoolId: user.profile.schoolId,
          alStream: user.profile.alStream,
          admissionNo: user.profile.admissionNo ?? "",
          city: user.profile.city,
          country: user.profile.country,
          address: user.profile.address ?? "",
          mobile: user.profile.mobile,
          whatsapp: user.profile.whatsapp ?? "",
          profession: user.profile.profession,
          employer: user.profile.employer ?? "",
          jobTitle: user.profile.jobTitle ?? "",
          maritalStatus: user.profile.maritalStatus,
          spouseName: user.profile.spouseName ?? "",
          children: user.profile.children ?? "",
          about: user.profile.about ?? "",
          facebook: user.profile.facebook ?? "",
          linkedin: user.profile.linkedin ?? "",
          instagram: user.profile.instagram ?? "",
          website: user.profile.website ?? "",
          photoKey: user.profile.photoKey ?? "",
        }}
      />
    </div>
  );
}
