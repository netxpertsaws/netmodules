export function MemorialPanel({
  eyebrow,
  title,
  body,
  meta,
}: {
  eyebrow: string;
  title: string;
  body: string;
  meta?: string;
}) {
  return (
    <article className="memorial px-6 py-8">
      <p className="font-serif text-sm tracking-[0.22em] text-neutral-400">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-3xl font-medium">{title}</h2>
      {meta ? <p className="mt-2 text-sm text-neutral-400">{meta}</p> : null}
      <p className="mt-4 max-w-2xl whitespace-pre-wrap leading-relaxed text-neutral-300">{body}</p>
    </article>
  );
}
