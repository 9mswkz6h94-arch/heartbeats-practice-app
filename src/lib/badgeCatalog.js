export const BADGES = {
  streak_7: { id: "streak_7", name: "Week Warrior", description: "7 consecutive days of practice", icon: "🔥", condition: "streak", threshold: 7 },
  streak_30: { id: "streak_30", name: "Monthly Master", description: "30 consecutive days of practice", icon: "⭐", condition: "streak", threshold: 30 },
  songs_5: { id: "songs_5", name: "Song Starter", description: "Memorize 5 songs", icon: "🎵", condition: "songs_memorized", threshold: 5 },
  songs_10: { id: "songs_10", name: "Song Master", description: "Memorize 10 songs", icon: "🎼", condition: "songs_memorized", threshold: 10 },
  practice_50: { id: "practice_50", name: "Practice Pro", description: "Complete 50 practice activities", icon: "💪", condition: "practice_sessions", threshold: 50 },
};

export function getBadgeProgress(stats, badge) {
  const currentByCondition = {
    streak: stats.streak || 0,
    songs_memorized: stats.songsMemorized || 0,
    practice_sessions: stats.completions || 0,
  };
  const current = currentByCondition[badge.condition] || 0;
  return { current, target: badge.threshold, percent: Math.min(100, Math.round((current / badge.threshold) * 100)), earned: current >= badge.threshold };
}
