import React, { useState, useEffect } from "react";
import "./PracticeCardDetail.css";

export default function PracticeCardDetail({
  step,
  assignment,
  onComplete,
  onSkip,
  onClose,
}) {
  const [showCelebration, setShowCelebration] = useState(false);

  const handleComplete = () => {
    setShowCelebration(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  return (
    <div className="detail-modal-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="detail-header">
          <div className="detail-assignment">
            <h2>{assignment.title}</h2>
            <span className="detail-instrument">{assignment.instrument_type}</span>
          </div>
          <div className="detail-step-number">Step {step.step_number}</div>
        </div>

        <div className="detail-body">
          <h3 className="detail-step-title">{step.title}</h3>
          <p className="detail-step-description">{step.description}</p>
        </div>

        {showCelebration && (
          <div className="celebration-container">
            <div className="confetti-emoji">🎉</div>
            <div className="confetti-emoji" style={{ animationDelay: "0.1s" }}>
              ✨
            </div>
            <div className="confetti-emoji" style={{ animationDelay: "0.2s" }}>
              ⭐
            </div>
            <div className="confetti-emoji" style={{ animationDelay: "0.3s" }}>
              🎉
            </div>
          </div>
        )}

        <div className="detail-actions">
          <button className="btn-complete" onClick={handleComplete}>
            ✓ I Practiced This
          </button>
          <button className="btn-skip" onClick={onSkip}>
            ⏭ Skip Today
          </button>
        </div>
      </div>
    </div>
  );
}
