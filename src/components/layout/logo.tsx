
import { AppLogoIcon } from "./app-logo-icon"; 
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconSize?: number;
  // textSize prop is removed as text is no longer displayed
}

export function Logo({ className, iconSize = 7 }: LogoProps) {
  return (
    <Link href="/dashboard" className={cn("flex items-center space-x-0 font-semibold", className)}> {/* space-x-2 changed to space-x-0 as there's no text */}
      <AppLogoIcon className={cn(`h-${iconSize} w-${iconSize}`, "text-sidebar-primary")} />
      {/* The text span has been removed */}
    </Link>
  );
}

