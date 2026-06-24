import React, { useState, useEffect } from "react";
import { getStudentBadges } from "../lib/badgeLogic";
import "./BadgeShowcase.css";

export default function BadgeShowcase({ studentId }) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, [studentId]);

  const fetchBadges = async () => {
    setLoading(true);
    const studentBadges = await getStudentBadges(studentId);
    setBadges(studentBadges);
    setLoading(false);
  };

  if (loading) {
    return <div className="badge-showcase"><p>Loading badges...</p></div>;
  }

  if (badges.length === 0) {
    return (
      <div className="badge-showcase">
        <p className="no-badges">
          Keep practicing! Badges appear when you reach milestones.
        </p>
      </div>
    );
  }

  return (
    <div className="badge-showcase">
      <h3>Badges Earned</h3>
      <div className="badges-grid">
        {badges.map((badge) => (
          <div key={badge.id} className="badge-item" title={badge.description}>
            <div className="badge-icon">{badge.icon}</div>
            <div className="badge-name">{badge.name}</div>
            <div className="badge-date">
              {new Date(badge.earned_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
