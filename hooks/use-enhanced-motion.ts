"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export function detectWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** 3D is an enhancement. Reduced motion or missing WebGL keeps the static UI. */
export function useEnhancedMotion() {
  const reduced = useReducedMotion();
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    setWebgl(detectWebGL());
  }, []);

  return {
    reduced: Boolean(reduced),
    webgl,
    enhance: !reduced && webgl,
  };
}
