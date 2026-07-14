import { cn } from "@/lib/utils";

type Tone = "primary" | "secondary" | "accent" | "neutral";

const tones: Record<Tone, string> = {
  primary: "bg-primary-tint text-primary",
  secondary: "bg-secondary-tint text-secondary-strong",
  accent: "bg-accent-tint text-accent-strong",
  neutral: "bg-surface-2 text-muted",
};

export function Pill({
  tone = "primary",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
