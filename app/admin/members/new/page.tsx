import { AdminMemberForm } from "@/components/admin/AdminMemberForm";

export default function NewMemberPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">New member</h1>
      <p className="text-sm text-slate-600">This creates a hidden profile and emails an invite. The member stays out of the directory until they set a password and accept consent.</p>
      <AdminMemberForm mode="create" />
    </div>
  );
}
