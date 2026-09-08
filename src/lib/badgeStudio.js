import { supabase } from "./supabaseClient";

export const BADGE_STUDIO_LIMITS = Object.freeze({
  title: 44,
  message: 180,
});

export const BADGE_TEMPLATES = Object.freeze([
  Object.freeze({
    id: "brave-first-try",
    title: "Brave First Try",
    message: "You gave something new a real try. That brave beginning matters.",
    characterId: "riffin",
    note: "For beginning before everything feels easy.",
  }),
  Object.freeze({
    id: "steady-sounds",
    title: "Steady Sounds",
    message: "You stayed with the music and found a steady way through.",
    characterId: "boppo",
    note: "For patient, steady work over time.",
  }),
  Object.freeze({
    id: "careful-listener",
    title: "Careful Listener",
    message: "You listened closely and let what you heard guide your next choice.",
    characterId: "ringlet",
    note: "For thoughtful listening and noticing.",
  }),
  Object.freeze({
    id: "joyful-curiosity",
    title: "Joyful Curiosity",
    message: "You followed your curiosity and found a musical idea of your own.",
    characterId: "plinka",
    note: "For playful experiments and good questions.",
  }),
  Object.freeze({
    id: "thoughtful-teammate",
    title: "Thoughtful Teammate",
    message: "You made room for someone else and helped the music come together.",
    characterId: "cymbi",
    note: "For collaboration, kindness, and shared music.",
  }),
]);

export const BADGE_PHYSICAL_FORMATS = Object.freeze([
  Object.freeze({
    id: "digital",
    name: "Digital badge only",
    detail: "Celebrate in the student app. Nothing is ordered or shipped.",
  }),
  Object.freeze({
    id: "embroidered-patch-3",
    name: "3-inch iron-on or sew-on patch",
    detail: "Recommended first physical pilot. It can be fulfilled one at a time after family approval and artwork sampling.",
  }),
  Object.freeze({
    id: "pinback-2-25",
    name: "2.25-inch pinback button",
    detail: "Adult or family display only—not the child-wearable default because it uses a sharp safety-pin backing.",
  }),
]);

function clampText(value, limit) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, limit);
}

export function createBadgeDraft(templateId = BADGE_TEMPLATES[0].id) {
  const template = BADGE_TEMPLATES.find((candidate) => candidate.id === templateId) || BADGE_TEMPLATES[0];
  return {
    templateId: template.id,
    title: template.title,
    message: template.message,
    characterId: template.characterId,
  };
}

export function normalizeBadgeDraft(draft = {}) {
  return {
    templateId: String(draft.templateId || "custom"),
    title: clampText(draft.title, BADGE_STUDIO_LIMITS.title),
    message: clampText(draft.message, BADGE_STUDIO_LIMITS.message),
    characterId: String(draft.characterId || "riffin"),
  };
}

export function validateBadgeAward({ studentIds = [], availableStudentIds = [], draft = {} } = {}) {
  const normalized = normalizeBadgeDraft(draft);
  const available = new Set(availableStudentIds);
  const validRecipients = [...new Set(studentIds)].filter((studentId) => available.has(studentId));
  const errors = [];

  if (!validRecipients.length) errors.push("Choose at least one student.");
  if (!normalized.title) errors.push("Add a badge title.");
  if (!normalized.message) errors.push("Add a student-facing message.");

  return { valid: errors.length === 0, errors, recipients: validRecipients, draft: normalized };
}

export function buildBadgeAwardPreview({ draft, students = [], physicalFormatId = "digital", createdAt = new Date().toISOString() } = {}) {
  const normalized = normalizeBadgeDraft(draft);
  const physicalFormat = BADGE_PHYSICAL_FORMATS.find((candidate) => candidate.id === physicalFormatId) || BADGE_PHYSICAL_FORMATS[0];

  return Object.freeze({
    id: `badge-review-${Date.parse(createdAt) || 0}`,
    status: "local-review-only",
    title: normalized.title,
    message: normalized.message,
    characterId: normalized.characterId,
    recipientNames: Object.freeze(students.map((student) => student.shortName || student.name)),
    physicalFormatId: physicalFormat.id,
    physicalFormatName: physicalFormat.name,
    orderPlaced: false,
    createdAt,
  });
}

export function createTeacherBadgeAwardsApi(client = supabase) {
  const award = async ({ teacherId, studentIds = [], draft = {}, physicalFormatId = "digital" } = {}) => {
    if (!teacherId) throw new Error("Teacher identity is required to award a badge.");

    const validation = validateBadgeAward({
      studentIds,
      availableStudentIds: studentIds,
      draft,
    });
    if (!validation.valid) throw new Error(validation.errors[0]);

    const format = BADGE_PHYSICAL_FORMATS.find((candidate) => candidate.id === physicalFormatId)
      || BADGE_PHYSICAL_FORMATS[0];
    const rows = validation.recipients.map((studentId) => ({
      student_id: studentId,
      teacher_id: teacherId,
      template_id: validation.draft.templateId,
      title: validation.draft.title,
      message: validation.draft.message,
      character_id: validation.draft.characterId,
      physical_format_id: format.id,
      order_status: "not-requested",
    }));

    const { data, error } = await client
      .from("teacher_badge_awards")
      .insert(rows)
      .select("id, student_id, title, message, character_id, physical_format_id, order_status, earned_at");
    if (error) throw error;
    return data || [];
  };

  return { award };
}

export const teacherBadgeAwardsApi = createTeacherBadgeAwardsApi();
