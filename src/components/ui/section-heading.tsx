import { cn } from "@/lib/utils";
import { Pill } from "./pill";
import { Reveal } from "./reveal";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? (
        <Reveal>
          <Pill tone="secondary">{eyebrow}</Pill>
        </Reveal>
      ) : null}
      <Reveal delay={0.05}>
        <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl md:text-[2.75rem]">
          {title}
        </h2>
      </Reveal>
      {subtitle ? (
        <Reveal delay={0.1}>
          <p
            className={cn(
              "text-balance text-lg text-muted",
              align === "center" ? "max-w-2xl" : "max-w-xl",
            )}
          >
            {subtitle}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
