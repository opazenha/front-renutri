import { AppLogoIcon } from "./app-logo-icon"; // Changed import
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
}

export function Logo({ className, iconSize = 7, textSize = "lg" }: LogoProps) {
  return (
    <Link href="/dashboard" className={cn("flex items-center space-x-2 font-semibold", className)}>
      <AppLogoIcon className={cn(`h-${iconSize} w-${iconSize}`, "text-sidebar-primary")} /> {/* Changed icon */}
      <span className={cn(`text-${textSize}`, "text-sidebar-foreground")}>ReNutri</span>
    </Link>
  );
}
