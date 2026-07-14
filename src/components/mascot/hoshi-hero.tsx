"use client";

import { motion } from "framer-motion";

// Hoshi's intrinsic fur/character palette (theme-independent — see hoshi-static.tsx).
const FUR = "#efc99a";
const FUR_DEEP = "#e3ad6f";
const CREAM = "#faecd2";
const WHITE = "#fffaf2";
const INK = "#3a3560";
const BLUSH = "#ff9ec4";
const EAR_INNER = "#ffb9d6";
const STAR = "#ffc53d";

/** The cute Hoshi face, with a periodic blink and a twinkling star. */
function AnimatedHoshiFace({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 220"
      className={className}
      role="img"
      aria-label="Hoshi, the friendly Shiba Inu mascot"
    >
      {/* ears */}
      <g>
        <path d="M52 78 L38 26 L92 58 Z" fill={FUR_DEEP} />
        <path d="M168 78 L182 26 L128 58 Z" fill={FUR_DEEP} />
        <path d="M58 72 L49 40 L84 60 Z" fill={EAR_INNER} />
        <path d="M162 72 L171 40 L136 60 Z" fill={EAR_INNER} />
      </g>

      {/* head */}
      <path
        d="M110 40 C158 40 182 74 182 112 C182 156 150 184 110 184 C70 184 38 156 38 112 C38 74 62 40 110 40 Z"
        fill={CREAM}
      />

      {/* muzzle */}
      <path
        d="M110 96 C142 96 158 116 158 138 C158 164 136 180 110 180 C84 180 62 164 62 138 C62 116 78 96 110 96 Z"
        fill={WHITE}
      />

      {/* shiba eyebrow markings */}
      <ellipse cx="80" cy="86" rx="9" ry="7" fill={FUR} />
      <ellipse cx="140" cy="86" rx="9" ry="7" fill={FUR} />

      {/* eyes (blink) */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        animate={{ scaleY: [1, 1, 0.12, 1] }}
        transition={{ duration: 4.2, repeat: Infinity, times: [0, 0.9, 0.95, 1], ease: "easeInOut" }}
      >
        <ellipse cx="82" cy="106" rx="10" ry="12" fill={INK} />
        <ellipse cx="138" cy="106" rx="10" ry="12" fill={INK} />
        <circle cx="85.5" cy="101.5" r="3.4" fill={WHITE} />
        <circle cx="141.5" cy="101.5" r="3.4" fill={WHITE} />
      </motion.g>

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

      {/* star charm (Hoshi = star), twinkling */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        animate={{ scale: [1, 1.18, 1], rotate: [0, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M172 150 l4.6 9.3 10.3 1.5 -7.4 7.3 1.7 10.2 -9.2 -4.8 -9.2 4.8 1.7 -10.2 -7.4 -7.3 10.3 -1.5 Z"
          fill={STAR}
          stroke="#e0a92c"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </motion.g>
    </svg>
  );
}

const ORBS = [
  { pos: "left-[5%] top-[26%]", size: "size-11", color: "bg-primary", delay: 0 },
  { pos: "right-[7%] top-[14%]", size: "size-8", color: "bg-secondary", delay: 0.6 },
  { pos: "right-[3%] bottom-[26%]", size: "size-10", color: "bg-accent", delay: 1.1 },
  { pos: "left-[2%] bottom-[30%]", size: "size-7", color: "bg-info", delay: 0.3 },
  { pos: "left-[46%] top-[3%]", size: "size-6", color: "bg-success", delay: 0.9 },
];

const SPARKLES = [
  { pos: "left-[16%] top-[18%]", delay: 0.2 },
  { pos: "right-[18%] bottom-[16%]", delay: 1.2 },
  { pos: "right-[26%] top-[40%]", delay: 0.7 },
];

export function HoshiHero() {
  return (
    <div className="relative aspect-square w-full max-w-md">
      {/* floating bubbles */}
      {ORBS.map((o, i) => (
        <motion.div
          key={i}
          aria-hidden
          className={`absolute ${o.pos} ${o.size} rounded-full ${o.color} opacity-90 shadow-[var(--shadow-soft)]`}
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: 3 + o.delay, repeat: Infinity, ease: "easeInOut", delay: o.delay }}
        />
      ))}

      {/* sparkles */}
      {SPARKLES.map((s, i) => (
        <motion.div
          key={`s${i}`}
          aria-hidden
          className={`absolute ${s.pos} text-accent`}
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], rotate: [0, 90, 180] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
        >
          <svg viewBox="0 0 24 24" className="size-4 fill-current">
            <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
          </svg>
        </motion.div>
      ))}

      {/* ground shadow */}
      <motion.div
        aria-hidden
        className="absolute bottom-[9%] left-1/2 h-3 w-2/5 -translate-x-1/2 rounded-[100%] bg-ink/10 blur-md"
        animate={{ scaleX: [1, 0.86, 1], opacity: [0.9, 0.6, 0.9] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* floating mascot */}
      <motion.div
        className="grid h-full w-full place-items-center"
        animate={{ y: [0, -12, 0], rotate: [-2.5, 2.5, -2.5] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <AnimatedHoshiFace className="w-[78%] drop-shadow-[0_18px_34px_rgb(var(--jl-shadow)/0.2)]" />
      </motion.div>
    </div>
  );
}
