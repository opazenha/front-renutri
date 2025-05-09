// src/components/layout/app-logo-icon.tsx
import type { SVGProps } from 'react';

export function AppLogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 60 60"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Scale body (rounded rectangle) */}
      <path d="M8 18C8 16.8954 8.89543 16 10 16H50C51.1046 16 52 16.8954 52 18V50C52 51.1046 51.1046 52 50 52H10C8.89543 52 8 51.1046 8 50V18Z" />
      {/* Dial (semi-circle) */}
      <path d="M20 16C20 10.4772 24.4772 6 30 6C35.5228 6 40 10.4772 40 16" />
      {/* Dial needle lines (simplified) */}
      <line x1="30" y1="7" x2="30" y2="12" />
      <line x1="25" y1="9" x2="27" y2="13" /> {/* Adjusted for symmetry */}
      <line x1="35" y1="9" x2="33" y2="13" /> {/* Adjusted for symmetry */}
      {/* Plus sign (centered in left half of body) */}
      <line x1="18" y1="34" x2="30" y2="34" />
      <line x1="24" y1="28" x2="24" y2="40" />
      {/* Pulse line (centered in right half of body) */}
      <path d="M36 36L39 36L41 32L45 40L47 36L50 36" /> {/* Adjusted pulse line points for better visual */}
    </svg>
  );
}
