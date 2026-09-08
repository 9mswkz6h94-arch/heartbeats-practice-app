import { supabase } from "./supabaseClient";
import { fetchStudentStats } from "./studentStats";
import { BADGES, getBadgeProgress } from "./badgeCatalog";

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
    return [];
  }
};

export const getBadgeShowcase = async (studentId) => {
  const [earnedBadges, stats] = await Promise.all([
    getStudentBadges(studentId),
    fetchStudentStats(studentId),
  ]);
  const earnedById = new Map(earnedBadges.map((badge) => [badge.id, badge]));

  return Object.values(BADGES).map((badge) => ({
    ...badge,
    ...getBadgeProgress(stats, badge),
    earned_at: earnedById.get(badge.id)?.earned_at || null,
  }));
};
