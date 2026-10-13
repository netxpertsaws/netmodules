"use client";

export function StepWizard({
  steps,
  index,
  onBack,
  onNext,
  backLabel,
  nextLabel,
  submitLabel,
  children,
  isLast,
  busy,
}: {
  steps: string[];
  index: number;
  onBack: () => void;
  onNext: () => void;
  backLabel: string;
  nextLabel: string;
  submitLabel: string;
  children: React.ReactNode;
  isLast: boolean;
  busy?: boolean;
}) {
  return (
    <div>
      <ol className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {steps.map((step, stepIndex) => (
          <li
            key={step}
            className={`shrink-0 rounded-full px-3 py-2 text-xs ${stepIndex === index ? "bg-gold text-navy-900" : "bg-white/5 text-[var(--muted)]"}`}
          >
            {stepIndex + 1}. {step}
          </li>
        ))}
      </ol>
      <div className="min-h-64">{children}</div>
      <div className="mt-6 flex gap-3">
        {index > 0 ? (
          <button type="button" className="min-h-touch rounded-full border border-[var(--line)] px-5" onClick={onBack}>
            {backLabel}
          </button>
        ) : null}
        <button
          type="button"
          disabled={busy}
          className="min-h-touch rounded-full bg-gold px-6 font-semibold text-navy-900 disabled:opacity-60"
          onClick={onNext}
        >
          {isLast ? submitLabel : nextLabel}
        </button>
      </div>
    </div>
  );
}
