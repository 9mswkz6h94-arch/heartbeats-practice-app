import {
  clampStickerPageIndex,
  filterStickerPages,
  formatStickerCopyCount,
  mockStickerPages,
  reviewStickerPages,
} from "./stickerBook";
import { characterIds } from "./characterRegistry";

describe("sticker book helpers", () => {
  test("filters pages by purpose and character pack", () => {
    expect(filterStickerPages(mockStickerPages, "encourage", "riffin").map((page) => page.id))
      .toEqual(["riffin-encourage"]);
    expect(filterStickerPages(mockStickerPages, "connect", "other")).toEqual([]);
    expect(filterStickerPages(reviewStickerPages, "encourage", "ringlet").map((page) => page.id))
      .toEqual(["ringlet-encourage"]);
    expect(filterStickerPages(reviewStickerPages, "connect", "spirlo").map((page) => page.id))
      .toEqual(["spirlo-connect"]);
  });

  test("includes one complete three-sticker set for all nine review characters", () => {
    expect(reviewStickerPages).toHaveLength(characterIds.length * 3);
    characterIds.forEach((characterId) => {
      expect(reviewStickerPages.filter((page) => page.characterId === characterId).map((page) => page.purpose).sort())
        .toEqual(["celebrate", "connect", "encourage"]);
    });
  });

  test("keeps page navigation inside the filtered book", () => {
    expect(clampStickerPageIndex(-2, 3)).toBe(0);
    expect(clampStickerPageIndex(8, 3)).toBe(2);
    expect(clampStickerPageIndex(1, 0)).toBe(0);
  });

  test("formats private copy counts clearly", () => {
    expect(formatStickerCopyCount(1)).toBe("1 copy in your book");
    expect(formatStickerCopyCount(3)).toBe("3 copies in your book");
  });
});
