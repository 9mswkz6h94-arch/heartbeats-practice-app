import React, { useState, useEffect, useCallback } from "react";
import { BADGE_EVENT, getBadgeShowcase } from "../lib/badgeLogic";
import "./BadgeShowcase.css";

export default function BadgeShowcase({ studentId }) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlockedBadge, setUnlockedBadge] = useState(null);

  const fetchBadges = useCallback(async () => {
    setLoading(true);
    const studentBadges = await getBadgeShowcase(studentId);
    setBadges(studentBadges);
    setLoading(false);
  }, [studentId]);

  useEffect(() => { fetchBadges(); }, [fetchBadges]);

  useEffect(() => {
    const handleAward = (event) => {
      const newest = event.detail?.badges?.[0];
      if (newest) setUnlockedBadge(newest);
      fetchBadges();
    };
    window.addEventListener(BADGE_EVENT, handleAward);
    return () => window.removeEventListener(BADGE_EVENT, handleAward);
  }, [fetchBadges]);

  if (loading) {
    return <div className="badge-showcase" role="status"><p>Loading badges…</p></div>;
  }

  return (
    <div className="badge-showcase">
      {unlockedBadge && (
        <div className="badge-unlock" role="status">
          <span className="badge-unlock-icon">{unlockedBadge.icon}</span>
          <div><strong>New badge unlocked!</strong><span>{unlockedBadge.name}</span></div>
          <button type="button" onClick={() => setUnlockedBadge(null)} aria-label="Close badge celebration">Close</button>
        </div>
      )}
      <h2>Badge journey</h2>
      <p>Every bit of practice counts. Here’s what you’ve earned and what’s getting closer.</p>
      <div className="badges-grid">
        {badges.map((badge) => (
          <div key={badge.id} className={`badge-item ${badge.earned_at ? "earned" : "locked"}`}>
            <div className="badge-icon">{badge.icon}</div>
            <div className="badge-name">{badge.name}</div>
            <div className="badge-description">{badge.description}</div>
            <div className="badge-date">
              {badge.earned_at ? `Earned ${new Date(badge.earned_at).toLocaleDateString()}` : `${badge.current} of ${badge.target}`}
            </div>
            {!badge.earned_at && (
              <div className="badge-progress" role="progressbar" aria-label={`${badge.name} progress`} aria-valuenow={badge.current} aria-valuemin="0" aria-valuemax={badge.target}>
                <span style={{ width: `${badge.percent}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
