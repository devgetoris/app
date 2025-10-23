import { Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrisAILogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
  iconSize?: "sm" | "md" | "lg";
}

export function OrisAILogo({
  className,
  showText = true,
  textClassName,
  iconSize = "md",
}: OrisAILogoProps) {
  const sizeClasses = {
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
        <Rocket
          className={cn("text-primary-foreground", sizeClasses[iconSize])}
        />
      </div>
      {showText && (
        <span className={cn("text-2xl font-bold text-primary", textClassName)}>
          OrisAI
        </span>
      )}
    </div>
  );
}
