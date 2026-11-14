"use client";
import { useEffect, useState } from "react";

/** true si el usuario pidió reducir el movimiento en su sistema. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/** Número que sube desde 0 hasta su valor; sin animación si se reduce el movimiento. */
export function CountUp({ value, decimals = 0, duration = 900, suffix = "" }: { value: number; decimals?: number; duration?: number; suffix?: string }) {
  const reduced = usePrefersReducedMotion();
  const [animated, setAnimated] = useState(0);
  const shown = reduced ? value : animated;
  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimated(value * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, reduced]);
  return <>{shown.toLocaleString("es", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</>;
}

/** Ilustración decorativa: planeta con un satélite en órbita. */
export function OrbitArt({ size = 320, className = "" }: { size?: number; className?: string }) {
  return <svg className={`orbit-art ${className}`} width={size} height={size} viewBox="0 0 320 320" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="planet" cx="38%" cy="32%" r="75%">
        <stop offset="0%" stopColor="#9fdcb6" />
        <stop offset="55%" stopColor="#2f8a62" />
        <stop offset="100%" stopColor="#123d2e" />
      </radialGradient>
      <linearGradient id="ring" x1="0" x2="1">
        <stop offset="0%" stopColor="#f2b05e" stopOpacity="0" />
        <stop offset="50%" stopColor="#f2b05e" stopOpacity=".9" />
        <stop offset="100%" stopColor="#f2b05e" stopOpacity="0" />
      </linearGradient>
    </defs>
    <circle className="orbit-glow" cx="160" cy="160" r="118" fill="#cfeedd" opacity=".55" />
    <circle cx="160" cy="160" r="86" fill="url(#planet)" />
    <path className="orbit-fields" d="M98 150c22-14 48-10 64 2s42 14 60 0M104 182c20-10 40-6 56 4s40 10 54-2" fill="none" stroke="#d9f2e2" strokeOpacity=".55" strokeWidth="3" strokeLinecap="round" />
    <g className="orbit-ring">
      <ellipse cx="160" cy="160" rx="146" ry="54" fill="none" stroke="url(#ring)" strokeWidth="2" transform="rotate(-18 160 160)" />
    </g>
    <g className="orbit-satellite">
      <g transform="translate(160 26)">
        <rect x="-16" y="-5" width="10" height="10" rx="2" fill="#7fb7d6" />
        <rect x="6" y="-5" width="10" height="10" rx="2" fill="#7fb7d6" />
        <rect x="-6" y="-7" width="12" height="14" rx="3" fill="#f6f4ec" stroke="#134634" strokeWidth="2" />
      </g>
    </g>
  </svg>;
}
