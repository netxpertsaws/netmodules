export function DatabaseNotice() {
  return (
    <div className="glass mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold">Database not ready</h1>
      <p className="mt-3 text-[var(--muted)]">
        Start PostgreSQL, set DATABASE_URL, then run <code>npx prisma migrate deploy</code> and <code>npm run db:seed</code>.
      </p>
    </div>
  );
}
