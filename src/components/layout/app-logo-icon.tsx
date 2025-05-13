// src/components/layout/app-logo-icon.tsx
import type { SVGProps } from 'react';

export function AppLogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="500"
      height="500"
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props} // Spread props to allow className and other SVG attributes
    >
      {/* Scale Base */}
      <rect x="100" y="400" width="300" height="50" fill="#E0E0E0"/>
      
      {/* Vertical Scale Post */}
      <rect x="225" y="100" width="50" height="300" fill="#E0E0E0"/>
      
      {/* Horizontal Scale Arm (Cross) */}
      <rect x="100" y="225" width="300" height="50" fill="#E0E0E0"/>
      
      {/* Heartbeat Tape Measure Line */}
      <path d="M50 250 C 100 200, 150 300, 200 250 C 250 200, 300 300, 350 250 C 400 200, 450 300, 500 250" stroke="hsl(var(--primary))" strokeWidth="15" fill="none"/>
    </svg>
  );
}
