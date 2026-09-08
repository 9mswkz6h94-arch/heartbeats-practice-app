const mockUpsert = jest.fn();

jest.mock("./supabaseClient", () => ({
  supabase: {
    from: jest.fn(() => ({ upsert: mockUpsert })),
  },
}));

import { supabase } from "./supabaseClient";
import { ensureTodayRows, isInactivePracticeWrite } from "./practiceStatus";

describe("practice status safeguards", () => {
  beforeEach(() => {
    mockUpsert.mockReset();
    supabase.from.mockReturnValue({ upsert: mockUpsert });
  });

  test("recognizes the database's stale-assignment rejection", () => {
    expect(isInactivePracticeWrite({
      code: "23514",
      message: "Assignment is no longer active or practice step does not match",
    })).toBe(true);
  });

  test("does not hide unrelated database failures", () => {
    expect(isInactivePracticeWrite({ code: "42501", message: "Permission denied" })).toBe(false);
    expect(isInactivePracticeWrite({ code: "23514", message: "Different constraint" })).toBe(false);
  });

  test("keeps valid cards when one stale step breaks the bulk write", async () => {
    const staleError = {
      code: "23514",
      message: "Assignment is no longer active or practice step does not match",
    };
    mockUpsert
      .mockResolvedValueOnce({ error: staleError })
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: staleError });
    const statusMap = {};

    const rejected = await ensureTodayRows("student-1", [
      { id: "active-step", category: "pieces" },
      { id: "stale-step", category: "pieces" },
    ], statusMap);

    expect([...rejected]).toEqual(["stale-step"]);
    expect(statusMap).toEqual({ "active-step": "pending" });
    expect(mockUpsert).toHaveBeenCalledTimes(3);
  });
});
