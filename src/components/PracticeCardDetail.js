import React, { useEffect, useRef, useState } from "react";
import "./PracticeCardDetail.css";

export default function PracticeCardDetail({
  step,
  assignment,
  onComplete,
  onSkip,
  onClose,
  readOnly = false,
}) {
  const [showCelebration, setShowCelebration] = useState(false);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    closeRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll(
        'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  const handleComplete = () => {
    setShowCelebration(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  return (
    <div className="detail-modal-overlay" onClick={onClose}>
      <div ref={dialogRef} className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="practice-detail-title" onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} type="button" className="modal-close" onClick={onClose}>
          Close
        </button>

        {readOnly && (
          <div className="preview-banner" role="status">Preview mode — nothing here is saved</div>
        )}

        <div className="detail-header">
          <div className="detail-assignment">
            <h2 id="practice-detail-title">{assignment.title}</h2>
            <span className="detail-instrument">{assignment.instrument_type}</span>
          </div>
          <div className="detail-step-number">Step {step.step_number}</div>
        </div>

        <div className="detail-body">
          <h3 className="detail-step-title">{step.title}</h3>
          <p className="detail-step-description">{step.description}</p>
        </div>

        {assignment.attachment_url && (() => {
          const url = assignment.attachment_url;
          const isPdf = url.toLowerCase().includes(".pdf");
          return (
            <div className="detail-attachment">
              <div className="detail-attachment-label">
                {isPdf ? "Assignment sheet (PDF)" : "Assignment sheet"}
              </div>
              {isPdf ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-attachment-pdf"
                >
                  Open PDF assignment sheet
                </a>
              ) : (
                <img
                  src={url}
                  alt="Assignment sheet"
                  className="detail-attachment-img"
                />
              )}
            </div>
          );
        })()}

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

        {readOnly ? (
          <p className="preview-action-note" role="status">Practice actions are disabled in this teacher preview.</p>
        ) : (
          <div className="detail-actions">
            <button type="button" className="btn-complete" onClick={handleComplete} disabled={showCelebration}>
              {showCelebration ? "Practice recorded" : "I practiced this"}
            </button>
            <button type="button" className="btn-skip" onClick={onSkip} disabled={showCelebration}>
              Skip for today
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
