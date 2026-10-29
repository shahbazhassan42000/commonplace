"use client";

import { type ReactNode, useEffect, useRef } from "react";

/**
 * Wraps a decorative autumn friend: hidden from assistive tech, click-through,
 * and its animations pause while it's offscreen (see .critter in globals.css).
 */
export function Critter({ className = "", children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      el.toggleAttribute("data-paused", !entry.isIntersecting);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} aria-hidden="true" className={`critter ${className}`}>
      {children}
    </span>
  );
}
