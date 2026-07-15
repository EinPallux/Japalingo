import { describe, expect, it } from "vitest";
import { equippedEmojis, getShopItem, SHOP_ITEMS, SHOP_SECTIONS } from "@/lib/shop";

describe("shop catalog", () => {
  it("has unique ids and positive prices", () => {
    const ids = SHOP_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const i of SHOP_ITEMS) expect(i.price).toBeGreaterThan(0);
  });

  it("cosmetics declare a slot; boosts/protection do not", () => {
    for (const i of SHOP_ITEMS) {
      if (i.kind === "cosmetic") expect(i.slot).toBeDefined();
      else expect(i.slot).toBeUndefined();
    }
  });

  it("every section id resolves to a real item, covering all items exactly once", () => {
    const sectionIds = SHOP_SECTIONS.flatMap((s) => s.ids);
    for (const id of sectionIds) expect(getShopItem(id)).toBeDefined();
    expect(new Set(sectionIds).size).toBe(SHOP_ITEMS.length);
  });

  it("resolves equipped ids to emojis by slot", () => {
    const hat = SHOP_ITEMS.find((i) => i.slot === "hat")!;
    const em = equippedEmojis({ hat: hat.id, face: null, neck: null });
    expect(em.hat).toBe(hat.emoji);
    expect(em.face).toBeUndefined();
  });
});
