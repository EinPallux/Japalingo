/**
 * Shop catalog — the currency sinks. Two currencies:
 *   • Coins 🪙 — plentiful, earned from every correct answer (games + lessons).
 *   • Gems 💎 — premium, earned from finishing lessons and claiming daily quests.
 *
 * Three kinds of purchasable: a Streak Freeze (protection), an XP Boost
 * (consumable buff), and Hoshi cosmetics (own + equip). All cosmetics are pure
 * mascot/UI flair — no learning content — so the shop is not content-gated.
 */

export type Currency = "coins" | "gems";
export type CosmeticSlot = "hat" | "face" | "neck";
export type ItemKind = "streakFreeze" | "xpBoost" | "cosmetic";

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  currency: Currency;
  price: number;
  kind: ItemKind;
  slot?: CosmeticSlot; // set for cosmetics
}

export const COIN_PER_CORRECT = 2;
export const MAX_STREAK_FREEZES = 3;
export const XP_BOOST_MS = 15 * 60_000; // 15 minutes of double XP

export const CURRENCY_EMOJI: Record<Currency, string> = { coins: "🪙", gems: "💎" };

export const SHOP_ITEMS: ShopItem[] = [
  // Boosts & protection
  {
    id: "streak-freeze",
    name: "Streak Freeze",
    emoji: "❄️",
    desc: "Auto-used to save your streak if you miss a day.",
    currency: "gems",
    price: 30,
    kind: "streakFreeze",
  },
  {
    id: "xp-boost",
    name: "XP Boost",
    emoji: "⚡",
    desc: "Double XP for 15 minutes. Stacks your grind.",
    currency: "gems",
    price: 20,
    kind: "xpBoost",
  },

  // Hats
  { id: "hat-leaf", name: "Sprout", emoji: "🌱", desc: "A fresh little leaf.", currency: "coins", price: 60, kind: "cosmetic", slot: "hat" },
  { id: "hat-party", name: "Party Hat", emoji: "🎉", desc: "Every day's a win.", currency: "coins", price: 150, kind: "cosmetic", slot: "hat" },
  { id: "hat-tophat", name: "Top Hat", emoji: "🎩", desc: "Dapper Hoshi.", currency: "coins", price: 300, kind: "cosmetic", slot: "hat" },
  { id: "hat-graduate", name: "Graduate Cap", emoji: "🎓", desc: "Kana scholar.", currency: "gems", price: 40, kind: "cosmetic", slot: "hat" },
  { id: "hat-crown", name: "Crown", emoji: "👑", desc: "Royalty of reading.", currency: "gems", price: 90, kind: "cosmetic", slot: "hat" },
  { id: "hat-santa", name: "Santa Hat", emoji: "🎅", desc: "Seasonal cheer.", currency: "gems", price: 50, kind: "cosmetic", slot: "hat" },

  // Face
  { id: "face-glasses", name: "Specs", emoji: "👓", desc: "Studious look.", currency: "coins", price: 120, kind: "cosmetic", slot: "face" },
  { id: "face-shades", name: "Cool Shades", emoji: "🕶️", desc: "Too cool for kana.", currency: "coins", price: 220, kind: "cosmetic", slot: "face" },

  // Neck
  { id: "neck-scarf", name: "Cozy Scarf", emoji: "🧣", desc: "Warm and snug.", currency: "coins", price: 100, kind: "cosmetic", slot: "neck" },
  { id: "neck-bowtie", name: "Bow Tie", emoji: "🎀", desc: "Fancy pup.", currency: "coins", price: 140, kind: "cosmetic", slot: "neck" },
  { id: "neck-medal", name: "Gold Medal", emoji: "🏅", desc: "Champion reader.", currency: "gems", price: 45, kind: "cosmetic", slot: "neck" },
];

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id);
}

/** Ordered sections for the shop UI. */
export const SHOP_SECTIONS: { title: string; ids: string[] }[] = [
  { title: "Boosts & Protection", ids: ["streak-freeze", "xp-boost"] },
  { title: "Hats", ids: ["hat-leaf", "hat-party", "hat-tophat", "hat-graduate", "hat-crown", "hat-santa"] },
  { title: "Face", ids: ["face-glasses", "face-shades"] },
  { title: "Neck", ids: ["neck-scarf", "neck-bowtie", "neck-medal"] },
];

/** Resolve an equipped map of item ids into the emoji to overlay per slot. */
export function equippedEmojis(equipped: {
  hat: string | null;
  face: string | null;
  neck: string | null;
}): { hat?: string; face?: string; neck?: string } {
  const out: { hat?: string; face?: string; neck?: string } = {};
  (["hat", "face", "neck"] as const).forEach((slot) => {
    const id = equipped[slot];
    const item = id ? getShopItem(id) : undefined;
    if (item) out[slot] = item.emoji;
  });
  return out;
}
