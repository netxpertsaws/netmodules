"use client";

import { useState } from "react";
import { StepWizard } from "@/components/ui/StepWizard";

export function ShowcaseWizard() {
  const [index, setIndex] = useState(0);
  const steps = ["Account", "School", "Consent"];
  return (
    <StepWizard
      steps={steps}
      index={index}
      backLabel="Back"
      nextLabel="Continue"
      submitLabel="Submit"
      isLast={index === steps.length - 1}
      onBack={() => setIndex((value) => Math.max(0, value - 1))}
      onNext={() => setIndex((value) => Math.min(steps.length - 1, value + 1))}
    >
      <p>Step {index + 1}</p>
    </StepWizard>
  );
}
