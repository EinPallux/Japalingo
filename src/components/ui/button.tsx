import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "accent" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "btn-chunky inline-flex items-center justify-center gap-2 rounded-blob-xl font-display font-semibold leading-none select-none whitespace-nowrap disabled:pointer-events-none disabled:opacity-50";

const sizes: Record<Size, string> = {
  sm: "px-4 py-2.5 text-sm [--btn-lip:4px]",
  md: "px-5 py-3 text-base [--btn-lip:5px]",
  lg: "px-7 py-4 text-lg [--btn-lip:6px]",
};

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-[0_var(--btn-lip)_0_0_var(--jl-primary-strong)] hover:brightness-105",
  secondary:
    "bg-secondary text-white shadow-[0_var(--btn-lip)_0_0_var(--jl-secondary-strong)] hover:brightness-105",
  accent:
    "bg-accent text-ink shadow-[0_var(--btn-lip)_0_0_var(--jl-accent-strong)] hover:brightness-105",
  ghost:
    "bg-surface text-ink border-2 border-border shadow-[0_var(--btn-lip)_0_0_var(--jl-border)] hover:bg-surface-2",
  outline:
    "bg-transparent text-primary border-2 border-primary shadow-[0_var(--btn-lip)_0_0_var(--jl-primary)] hover:bg-primary-tint",
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: React.ReactNode;
};

type ButtonProps = BaseProps &
  (
    | ({ href: string } & Omit<React.ComponentPropsWithoutRef<typeof Link>, "className" | "children">)
    | ({ href?: undefined } & Omit<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        "className" | "children"
      >)
  );

export function Button(allProps: ButtonProps) {
  const { variant = "primary", size = "md", className, children, ...rest } = allProps;
  const classes = cn(base, sizes[size], variants[variant], className);

  if ("href" in allProps && typeof allProps.href === "string") {
    const linkProps = rest as Omit<
      React.ComponentPropsWithoutRef<typeof Link>,
      "className" | "children"
    >;
    return (
      <Link className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  const buttonProps = rest as Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "className" | "children"
  >;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
