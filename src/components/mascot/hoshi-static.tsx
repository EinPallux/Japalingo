/**
 * Hoshi — the Shiba Inu mascot, as a self-contained SVG.
 * Used for SSR, the 3D loading state, and the prefers-reduced-motion / no-WebGL fallback.
 * Hoshi's fur palette is intrinsic to the character (a shiba is tan regardless of UI theme),
 * so these colors are intentionally local constants, not themeable design tokens.
 */
const FUR = "#efc99a";
const FUR_DEEP = "#e3ad6f";
const CREAM = "#faecd2";
const WHITE = "#fffaf2";
const INK = "#3a3560";
const BLUSH = "#ff9ec4";
const EAR_INNER = "#ffb9d6";
const STAR = "#ffc53d";

export function HoshiStatic({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 220"
      className={className}
      role="img"
      aria-label="Hoshi, the friendly Shiba Inu mascot"
    >
      <defs>
        <radialGradient id="hoshi-face" cx="50%" cy="42%" r="65%">
          <stop offset="0%" stopColor={CREAM} />
          <stop offset="100%" stopColor={FUR} />
        </radialGradient>
      </defs>

      {/* soft shadow */}
      <ellipse cx="110" cy="196" rx="62" ry="12" fill={INK} opacity="0.1" />

      {/* ears */}
      <g>
        <path d="M52 78 L38 26 L92 58 Z" fill={FUR_DEEP} />
        <path d="M168 78 L182 26 L128 58 Z" fill={FUR_DEEP} />
        <path d="M58 72 L49 40 L84 60 Z" fill={EAR_INNER} />
        <path d="M162 72 L171 40 L136 60 Z" fill={EAR_INNER} />
      </g>

      {/* head */}
      <path
        d="M110 40
           C158 40 182 74 182 112
           C182 156 150 184 110 184
           C70 184 38 156 38 112
           C38 74 62 40 110 40 Z"
        fill="url(#hoshi-face)"
      />

      {/* cream muzzle + cheeks */}
      <path
        d="M110 96
           C142 96 158 116 158 138
           C158 164 136 180 110 180
           C84 180 62 164 62 138
           C62 116 78 96 110 96 Z"
        fill={WHITE}
      />

      {/* shiba eyebrow markings */}
      <ellipse cx="80" cy="86" rx="9" ry="7" fill={CREAM} />
      <ellipse cx="140" cy="86" rx="9" ry="7" fill={CREAM} />

      {/* eyes */}
      <ellipse cx="82" cy="106" rx="10" ry="12" fill={INK} />
      <ellipse cx="138" cy="106" rx="10" ry="12" fill={INK} />
      <circle cx="85.5" cy="101.5" r="3.4" fill={WHITE} />
      <circle cx="141.5" cy="101.5" r="3.4" fill={WHITE} />

      {/* blush */}
      <ellipse cx="70" cy="132" rx="12" ry="8" fill={BLUSH} opacity="0.55" />
      <ellipse cx="150" cy="132" rx="12" ry="8" fill={BLUSH} opacity="0.55" />

      {/* nose + happy mouth */}
      <path d="M103 127 h14 a5 5 0 0 1 -7 6 a5 5 0 0 1 -7 -6 Z" fill={INK} />
      <path
        d="M110 134 v7 M110 141 c-8 0 -13 -5 -14 -9 M110 141 c8 0 13 -5 14 -9"
        stroke={INK}
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />

      {/* star charm (Hoshi = star) */}
      <path
        d="M172 150 l4.6 9.3 10.3 1.5 -7.4 7.3 1.7 10.2 -9.2 -4.8 -9.2 4.8 1.7 -10.2 -7.4 -7.3 10.3 -1.5 Z"
        fill={STAR}
        stroke="#e0a92c"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
