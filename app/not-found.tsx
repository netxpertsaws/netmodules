import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-lg px-4 py-20">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <Link href="/" className="mt-4 inline-flex min-h-touch items-center text-gold">Back home</Link>
    </main>
  );
}
