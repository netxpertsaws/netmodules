import { NextResponse } from "next/server";
import { requireSuperAdmin, ActionError } from "@/lib/rbac";
import { reportCsv, reportPdf, reportSnapshot } from "@/lib/reports";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireSuperAdmin();
  } catch (error) {
    const status = error instanceof ActionError ? error.status : 403;
    return NextResponse.json({ error: "Forbidden" }, { status });
  }
  const format = new URL(request.url).searchParams.get("format");
  const snapshot = await reportSnapshot();
  if (format === "csv") {
    return new NextResponse(reportCsv(snapshot), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=vada-report.csv",
      },
    });
  }
  if (format === "pdf") {
    const pdf = await reportPdf(snapshot);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=vada-report.pdf",
      },
    });
  }
  return NextResponse.json(snapshot);
}
