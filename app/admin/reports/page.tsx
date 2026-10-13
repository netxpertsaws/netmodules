import Link from "next/link";
import { databaseReady } from "@/lib/prisma";
import { DatabaseNotice } from "@/components/layout/DatabaseNotice";
import { reportSnapshot } from "@/lib/reports";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  if (!(await databaseReady())) return <DatabaseNotice />;
  const snapshot = await reportSnapshot();
  const max = Math.max(1, ...snapshot.byDate.map(([, count]) => count));
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Reports</h1>
      <div className="flex gap-3 text-sm">
        <Link className="underline" href="/api/admin/reports?format=csv">Download CSV</Link>
        <Link className="underline" href="/api/admin/reports?format=pdf">Download PDF</Link>
      </div>
      <p>Recorded profile views: {snapshot.totalProfileViews}</p>
      <div className="grid grid-cols-7 gap-1">
        {snapshot.byDate.slice(-35).map(([date, count]) => (
          <div key={date} title={`${date}: ${count}`} className="h-8 rounded" style={{ background: `rgba(19,36,77,${0.15 + (count / max) * 0.85})` }} />
        ))}
      </div>
      <ul className="text-sm">
        {snapshot.mostViewed.map((row) => (
          <li key={row.id}>{row.label}: {row.views} views</li>
        ))}
      </ul>
    </div>
  );
}
