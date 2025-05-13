// src/components/layout/app-logo-icon.tsx
import type { SVGProps } from 'react';

export function AppLogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 60 60"
      fill="none"
      stroke="currentColor" // Path strokes will use this
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Scale Base */}
      <rect x="15" y="50" width="30" height="5" rx="1" strokeWidth="2" />
      {/* Scale Vertical Post */}
      <rect x="28" y="15" width="4" height="35" strokeWidth="2" />
      {/* Scale Beam */}
      <rect x="5" y="10" width="50" height="5" rx="1" strokeWidth="2" />
      
      {/* Heart (centered on post) - fill with current color (sidebar-primary), stroke slightly darker or same */}
      <path 
        d="M30 22 C25 18 18 22 18 29 C18 36 30 44 30 44 C30 44 42 36 42 29 C42 22 35 18 30 22 Z" 
        fill="currentColor" // Will use the text color (sidebar-primary from Logo component)
        stroke="currentColor" // Can be a darker shade or same as fill
        strokeWidth="1.5" 
      />
      
      {/* Pulse Line on Heart - stroke with a contrasting color (e.g., sidebar background if heart is dark, or a light color) */}
      <path 
        d="M23 32 L26 32 L28 29 L32 35 L34 32 L37 32" 
        stroke="hsl(var(--sidebar-primary-foreground))" // Use primary-foreground for contrast on primary-filled heart
        strokeWidth="1.5" 
      />
    </svg>
  );
}
