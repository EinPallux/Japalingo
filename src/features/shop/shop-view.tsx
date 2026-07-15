"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app/app-header";
import { HoshiAvatar } from "@/components/mascot/hoshi-avatar";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { sfx } from "@/lib/audio";
import {
  CURRENCY_EMOJI,
  equippedEmojis,
  getShopItem,
  MAX_STREAK_FREEZES,
  SHOP_SECTIONS,
  type ShopItem,
} from "@/lib/shop";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";
import { boostMinutesLeft, useProgress } from "@/stores/progress";

export function ShopView() {
  const mounted = useMounted();
  const coins = useProgress((s) => s.coins);
  const gems = useProgress((s) => s.gems);
  const streakFreezes = useProgress((s) => s.streakFreezes);
  const owned = useProgress((s) => s.ownedCosmetics);
  const equipped = useProgress((s) => s.equipped);
  const xpBoostUntil = useProgress((s) => s.xpBoostUntil);
  const buyItem = useProgress((s) => s.buyItem);
  const equip = useProgress((s) => s.equip);

  // Tick a clock so the XP-boost countdown stays live without calling Date.now()
  // during render (which would be impure / hydration-unsafe). 0 until first tick.
  const [now, setNow] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!mounted) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <HoshiStatic className="size-24 opacity-70" />
      </div>
    );
  }

  const boostMin = now > 0 ? boostMinutesLeft(xpBoostUntil, now) : 0;
  const balanceOf = (c: ShopItem["currency"]) => (c === "coins" ? coins : gems);

  const buy = (id: string) => {
    const res = buyItem(id);
    if (res.ok) sfx.levelUp();
    else sfx.wrong();
  };

  return (
    <>
      <AppHeader />
      <main id="main" className="mx-auto flex max-w-md flex-col gap-6 px-4 py-6">
        {/* Hoshi preview + balances */}
        <section className="flex flex-col items-center gap-3 rounded-blob-xl border border-border bg-gradient-to-b from-primary-tint to-surface p-5 text-center">
          <HoshiAvatar size={128} equipped={equippedEmojis(equipped)} />
          <h1 className="font-display text-2xl font-bold text-ink">Hoshi&apos;s Shop</h1>
          <p className="text-sm text-muted">Spend what you earn — dress up Hoshi and power up.</p>
          <div className="mt-1 flex items-center gap-3">
            <Balance emoji={CURRENCY_EMOJI.coins} value={coins} tone="text-accent-strong" />
            <Balance emoji={CURRENCY_EMOJI.gems} value={gems} tone="text-info" />
            {boostMin > 0 ? (
              <span className="rounded-full bg-accent-tint px-3 py-1 text-sm font-bold text-accent-strong">
                ⚡ 2× · {boostMin}m
              </span>
            ) : null}
          </div>
        </section>

        {SHOP_SECTIONS.map((section) => (
          <section key={section.title} className="flex flex-col gap-3">
            <h2 className="font-display text-lg font-bold text-ink">{section.title}</h2>
            <div className="grid grid-cols-2 gap-3">
              {section.ids.map((id) => {
                const item = getShopItem(id)!;
                const isOwned = item.kind === "cosmetic" && owned.includes(id);
                const isEquipped = Boolean(item.slot && equipped[item.slot] === id);
                const maxed = item.kind === "streakFreeze" && streakFreezes >= MAX_STREAK_FREEZES;
                const active = item.kind === "xpBoost" && boostMin > 0;
                const afford = balanceOf(item.currency) >= item.price;

                return (
                  <ItemCard
                    key={id}
                    item={item}
                    owned={isOwned}
                    equipped={isEquipped}
                    maxed={maxed}
                    active={active}
                    afford={afford}
                    freezeCount={item.kind === "streakFreeze" ? streakFreezes : undefined}
                    onBuy={() => buy(id)}
                    onEquip={() => {
                      equip(id);
                      sfx.tap();
                    }}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}

function Balance({ emoji, value, tone }: { emoji: string; value: number; tone: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 font-display font-bold shadow-[var(--shadow-soft)]">
      <span aria-hidden>{emoji}</span>
      <span className={tone}>{value}</span>
    </span>
  );
}

function ItemCard({
  item,
  owned,
  equipped,
  maxed,
  active,
  afford,
  freezeCount,
  onBuy,
  onEquip,
}: {
  item: ShopItem;
  owned: boolean;
  equipped: boolean;
  maxed: boolean;
  active: boolean;
  afford: boolean;
  freezeCount?: number;
  onBuy: () => void;
  onEquip: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-blob-lg border border-border bg-surface p-3 text-center">
      <span aria-hidden className="text-4xl">
        {item.emoji}
      </span>
      <div className="flex-1">
        <p className="font-display text-sm font-bold text-ink">{item.name}</p>
        <p className="text-xs text-muted">{item.desc}</p>
      </div>

      {freezeCount !== undefined ? (
        <p className="text-xs font-semibold text-muted">
          Owned {freezeCount}/{MAX_STREAK_FREEZES}
        </p>
      ) : null}

      {owned ? (
        <button
          type="button"
          onClick={onEquip}
          aria-pressed={equipped}
          className={cn(
            "w-full rounded-full px-3 py-2 font-display text-sm font-bold transition active:translate-y-0.5",
            equipped
              ? "bg-success/15 text-success-strong"
              : "bg-primary text-white shadow-[0_3px_0_0_var(--jl-primary-strong)] hover:brightness-105",
          )}
        >
          {equipped ? "✓ Equipped" : "Equip"}
        </button>
      ) : maxed ? (
        <span className="w-full rounded-full bg-surface-2 px-3 py-2 text-center font-display text-sm font-bold text-muted">
          Maxed out
        </span>
      ) : active ? (
        <span className="w-full rounded-full bg-accent-tint px-3 py-2 text-center font-display text-sm font-bold text-accent-strong">
          Active
        </span>
      ) : (
        <button
          type="button"
          onClick={onBuy}
          disabled={!afford}
          className={cn(
            "flex w-full items-center justify-center gap-1 rounded-full px-3 py-2 font-display text-sm font-bold transition",
            afford
              ? "bg-accent text-ink shadow-[0_3px_0_0_var(--jl-accent-strong)] hover:brightness-105 active:translate-y-0.5"
              : "cursor-not-allowed bg-surface-2 text-muted",
          )}
        >
          <span aria-hidden>{CURRENCY_EMOJI[item.currency]}</span>
          {item.price}
        </button>
      )}
    </div>
  );
}
