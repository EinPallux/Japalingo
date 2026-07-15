import { HoshiStatic } from "./hoshi-static";

type Slots = { hat?: string; face?: string; neck?: string };

/** Center point (% of the box) and size (fraction of the box) for each slot's
 *  emoji overlay, tuned to Hoshi's 220×220 artwork. */
const PLACEMENT: Record<keyof Slots, { top: string; size: number }> = {
  hat: { top: "4%", size: 0.4 },
  face: { top: "47%", size: 0.36 },
  neck: { top: "83%", size: 0.38 },
};

/**
 * Hoshi with equipped cosmetics overlaid as emoji. Pure/presentational — the
 * caller resolves owned+equipped item ids into emoji (via `equippedEmojis`).
 */
export function HoshiAvatar({
  size = 128,
  equipped,
  className,
}: {
  size?: number;
  equipped: Slots;
  className?: string;
}) {
  return (
    <div className={className} style={{ position: "relative", width: size, height: size }}>
      <HoshiStatic className="size-full" />
      {(["hat", "face", "neck"] as const).map((slot) => {
        const emoji = equipped[slot];
        if (!emoji) return null;
        const p = PLACEMENT[slot];
        return (
          <span
            key={slot}
            aria-hidden
            style={{
              position: "absolute",
              top: p.top,
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: size * p.size,
              lineHeight: 1,
              pointerEvents: "none",
              filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.15))",
            }}
          >
            {emoji}
          </span>
        );
      })}
    </div>
  );
}
