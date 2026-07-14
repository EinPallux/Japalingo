"use client";

import { useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { Component, type ReactNode } from "react";
import { useMounted } from "@/lib/use-mounted";
import { HoshiStatic } from "./hoshi-static";

const HoshiScene = dynamic(() => import("./hoshi-scene"), {
  ssr: false,
  loading: () => <StaticHoshi />,
});

function StaticHoshi() {
  return (
    <div className="grid h-full w-full place-items-center">
      <HoshiStatic className="h-[85%] w-[85%] drop-shadow-[0_20px_40px_rgba(42,42,74,0.22)]" />
    </div>
  );
}

/** If WebGL throws (unsupported / context lost), quietly fall back to the SVG Hoshi. */
class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <StaticHoshi /> : this.props.children;
  }
}

export function HoshiHero() {
  const reduce = useReducedMotion();
  const mounted = useMounted();

  const showStatic = !mounted || reduce;

  return (
    <div className="relative aspect-square w-full max-w-md">
      {showStatic ? (
        <StaticHoshi />
      ) : (
        <WebGLBoundary>
          <HoshiScene />
        </WebGLBoundary>
      )}
    </div>
  );
}
