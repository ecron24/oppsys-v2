import { Loader2 } from "lucide-react";
import { cn, P } from "@oppsys/ui";
import type { ReactNode } from "react";

const sizeClasses = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
  large: "h-16 w-16",
};

const colorClasses = {
  primary: "text-primary",
  secondary: "text-muted-foreground",
  success: "text-green-600",
  destructive: "text-red-600",
  warning: "text-yellow-600",
  white: "text-white",
  current: "text-current",
};

const textSizeClasses = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  large: "text-xl",
};

export function LoadingSpinner({
  size = "md",
  color = "primary",
  text = null,
  className = "",
  fullScreen = false,
}: LoadingSpinnerProps) {
  const content = (
    <div
      className={cn(
        "flex items-center justify-center",
        text ? "space-x-2" : undefined
      )}
    >
      <Loader2
        className={cn(
          sizeClasses[size],
          colorClasses[color],
          "animate-spin",
          className
        )}
      />
      {text && (
        <span
          className={cn(
            textSizeClasses[size],
            colorClasses[color],
            "font-medium"
          )}
        >
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          {content}
          {!text && size === "large" && (
            <P className="mt-4 text-muted-foreground text-lg">Chargement...</P>
          )}
        </div>
      </div>
    );
  }

  return content;
}
type LoadingSpinnerProps = {
  size?: keyof typeof sizeClasses;
  color?: keyof typeof colorClasses;
  text?: ReactNode;
  className?: string;
  fullScreen?: boolean;
};

export function PageLoader({
  text = "Chargement de la page...",
}: PageLoaderProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="large" color="primary" />
        <P className="mt-4 text-muted-foreground text-lg">{text}</P>
      </div>
    </div>
  );
}
type PageLoaderProps = {
  text?: ReactNode;
};

export function ContentLoader({
  text = "Chargement...",
  className = "",
}: ContentLoaderProps) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <LoadingSpinner size="lg" color="primary" text={text} />
    </div>
  );
}
type ContentLoaderProps = {
  text?: ReactNode;
  className?: string;
};
