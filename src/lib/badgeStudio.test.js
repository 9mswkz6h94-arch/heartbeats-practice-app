import {
  BADGE_STUDIO_LIMITS,
  BADGE_TEMPLATES,
  buildBadgeAwardPreview,
  createTeacherBadgeAwardsApi,
  createBadgeDraft,
  normalizeBadgeDraft,
  validateBadgeAward,
} from "./badgeStudio";

describe("Badge Studio", () => {
  test("starts from strength-based templates without streak or ranking pressure", () => {
    const language = JSON.stringify(BADGE_TEMPLATES).toLowerCase();
    expect(BADGE_TEMPLATES).toHaveLength(5);
    expect(language).not.toMatch(/streak|rank|leaderboard|perfect/);
    expect(createBadgeDraft("careful-listener")).toMatchObject({ title: "Careful Listener", characterId: "ringlet" });
  });

  test("normalizes student-facing copy to the deliberate design limits", () => {
    const draft = normalizeBadgeDraft({ title: `  ${"T".repeat(60)}  `, message: `  ${"M".repeat(220)}  ` });
    expect(draft.title).toHaveLength(BADGE_STUDIO_LIMITS.title);
    expect(draft.message).toHaveLength(BADGE_STUDIO_LIMITS.message);
  });

  test("requires an available recipient and complete copy", () => {
    expect(validateBadgeAward({ studentIds: ["not-in-roster"], availableStudentIds: ["alexandria"], draft: {} })).toMatchObject({
      valid: false,
      errors: ["Choose at least one student.", "Add a badge title.", "Add a student-facing message."],
    });
  });

  test("builds a multi-student physical preview without placing an order", () => {
    const preview = buildBadgeAwardPreview({
      draft: createBadgeDraft("brave-first-try"),
      students: [{ name: "Alexandria", shortName: "Alexandria" }, { name: "Sam" }],
      physicalFormatId: "embroidered-patch-3",
      createdAt: "2026-09-07T12:00:00.000Z",
    });
    expect(preview.recipientNames).toEqual(["Alexandria", "Sam"]);
    expect(preview.physicalFormatName).toBe("3-inch iron-on or sew-on patch");
    expect(preview.orderPlaced).toBe(false);
    expect(preview.status).toBe("local-review-only");
  });

  test("stores teacher-created awards without touching the automatic badge ledger", async () => {
    const select = jest.fn().mockResolvedValue({
      data: [{ id: "award-1", student_id: "student-1", order_status: "not-requested" }],
      error: null,
    });
    const insert = jest.fn(() => ({ select }));
    const from = jest.fn(() => ({ insert }));
    const api = createTeacherBadgeAwardsApi({ from });

    const awards = await api.award({
      teacherId: "teacher-1",
      studentIds: ["student-1"],
      draft: createBadgeDraft("careful-listener"),
      physicalFormatId: "embroidered-patch-3",
    });

    expect(from).toHaveBeenCalledWith("teacher_badge_awards");
    expect(insert).toHaveBeenCalledWith([
      expect.objectContaining({
        student_id: "student-1",
        teacher_id: "teacher-1",
        title: "Careful Listener",
        physical_format_id: "embroidered-patch-3",
        order_status: "not-requested",
      }),
    ]);
    expect(awards).toHaveLength(1);
  });
});
