import { supabase } from "./supabaseClient";

// Badge definitions
export const BADGES = {
  streak_7: {
    id: "streak_7",
    name: "Week Warrior",
    description: "7 consecutive days of practice",
    icon: "🔥",
    condition: "streak",
    threshold: 7,
  },
  streak_30: {
    id: "streak_30",
    name: "Monthly Master",
    description: "30 consecutive days of practice",
    icon: "⭐",
    condition: "streak",
    threshold: 30,
  },
  songs_5: {
    id: "songs_5",
    name: "Song Starter",
    description: "Memorize 5 songs",
    icon: "🎵",
    condition: "songs_memorized",
    threshold: 5,
  },
  songs_10: {
    id: "songs_10",
    name: "Song Master",
    description: "Memorize 10 songs",
    icon: "🎼",
    condition: "songs_memorized",
    threshold: 10,
  },
  practice_50: {
    id: "practice_50",
    name: "Practice Pro",
    description: "Complete 50 practice sessions",
    icon: "💪",
    condition: "practice_sessions",
    threshold: 50,
  },
};

/**
 * Check and award badges for a student based on their progress
 */
export const checkAndAwardBadges = async (studentId) => {
  try {
    // Get student's completion stats
    const { data: completions } = await supabase
      .from("completions")
      .select("completed_at")
      .eq("student_id", studentId);

    // Get assignments marked as memorized (via repertoire)
    const { data: repertoire } = await supabase
      .from("repertoire")
      .select("id")
      .eq("student_id", studentId);

    // Get already awarded badges
    const { data: awardedBadges } = await supabase
      .from("student_badges")
      .select("badge_id")
      .eq("student_id", studentId);

    const awardedBadgeIds = awardedBadges?.map((b) => b.badge_id) || [];

    // Calculate stats
    const practiceCount = completions?.length || 0;
    const songsCount = repertoire?.length || 0;
    const uniqueDays = new Set(
      completions?.map((c) => c.completed_at.split("T")[0]) || []
    ).size;

    // Check each badge condition
    const badgesToAward = [];

    if (uniqueDays >= 7 && !awardedBadgeIds.includes("streak_7")) {
      badgesToAward.push(BADGES.streak_7);
    }
    if (uniqueDays >= 30 && !awardedBadgeIds.includes("streak_30")) {
      badgesToAward.push(BADGES.streak_30);
    }
    if (songsCount >= 5 && !awardedBadgeIds.includes("songs_5")) {
      badgesToAward.push(BADGES.songs_5);
    }
    if (songsCount >= 10 && !awardedBadgeIds.includes("songs_10")) {
      badgesToAward.push(BADGES.songs_10);
    }
    if (practiceCount >= 50 && !awardedBadgeIds.includes("practice_50")) {
      badgesToAward.push(BADGES.practice_50);
    }

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
