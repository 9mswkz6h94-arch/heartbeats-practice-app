import { supabase } from "./supabaseClient";
import { fetchStudentStats } from "./studentStats";
import { BADGES, getBadgeProgress } from "./badgeCatalog";
import { getCharacter } from "./characterRegistry";

export { BADGES, getBadgeProgress } from "./badgeCatalog";

// Badge definitions
export const BADGE_EVENT = "heartbeats:badges-awarded";

/**
 * Check and award badges for a student based on their progress
 */
export const checkAndAwardBadges = async (studentId) => {
  try {
    const stats = await fetchStudentStats(studentId);

    // Get already awarded badges
    const { data: awardedBadges } = await supabase
      .from("student_badges")
      .select("badge_id")
      .eq("student_id", studentId);

    const awardedBadgeIds = awardedBadges?.map((b) => b.badge_id) || [];

    const badgesToAward = Object.values(BADGES).filter(
      (badge) =>
        getBadgeProgress(stats, badge).earned &&
        !awardedBadgeIds.includes(badge.id)
    );

    // Award new badges
    if (badgesToAward.length > 0) {
      const badgeInserts = badgesToAward.map((badge) => ({
        student_id: studentId,
        badge_id: badge.id,
      }));

      const { error } = await supabase
        .from("student_badges")
        .insert(badgeInserts);

      if (error) throw error;

      window.dispatchEvent(
        new CustomEvent(BADGE_EVENT, { detail: { badges: badgesToAward } })
      );

      return badgesToAward;
    }

    return [];
  } catch (err) {
    console.error("Error checking badges:", err);
    return [];
  }
};

/**
 * Get all badges for a student
 */
export const getStudentBadges = async (studentId) => {
  try {
    const { data } = await supabase
      .from("student_badges")
      .select("badge_id, earned_at")
      .eq("student_id", studentId)
      .order("earned_at", { ascending: false });

    return data?.map((b) => ({
      ...BADGES[b.badge_id],
      earned_at: b.earned_at,
    })) || [];
  } catch (err) {
    console.error("Error fetching badges:", err);
    throw err;
  }
};

function teacherBadgeTableIsUnavailable(error) {
  const message = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return ["42P01", "PGRST205"].includes(error?.code)
    || (message.includes("teacher_badge_awards") && message.includes("does not exist"));
}

export const getTeacherBadgeAwards = async (studentId, client = supabase) => {
  try {
    const { data, error } = await client
      .from("teacher_badge_awards")
      .select("id, title, message, character_id, earned_at")
      .eq("student_id", studentId)
      .order("earned_at", { ascending: false });

    if (error) {
      if (teacherBadgeTableIsUnavailable(error)) return [];
      throw error;
    }

    return (data || []).map((award) => {
      const character = getCharacter(award.character_id);
      return {
        id: `teacher-${award.id}`,
        name: award.title,
        description: award.message,
        icon: character?.emoji || "✨",
        source: "teacher",
        earned_at: award.earned_at,
      };
    });
  } catch (err) {
    console.error("Error fetching teacher-created badges:", err);
    throw err;
  }
};

export const getBadgeShowcase = async (studentId) => {
  const [earnedBadges, teacherAwards, stats] = await Promise.all([
    getStudentBadges(studentId),
    getTeacherBadgeAwards(studentId),
    fetchStudentStats(studentId),
  ]);
  const earnedById = new Map(earnedBadges.map((badge) => [badge.id, badge]));

  const automaticBadges = Object.values(BADGES).map((badge) => ({
    ...badge,
    ...getBadgeProgress(stats, badge),
    earned_at: earnedById.get(badge.id)?.earned_at || null,
  }));

  return [...teacherAwards, ...automaticBadges];
};
