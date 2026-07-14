"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Fade + rise into view once. The root <MotionConfig reducedMotion="user">
 * (see theme-provider) suppresses the transform for reduced-motion users while
 * keeping the opacity fade — so this always renders the same tree on server and
 * client (no hydration divergence).
 */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
