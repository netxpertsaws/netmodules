"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function StatusChart({ data }: { data: { status: string; count: number }[] }) {
  return (
    <div className="h-64 w-full rounded-xl bg-white p-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="status" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#13244D" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
