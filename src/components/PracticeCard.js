import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./PracticeCard.css";

export default function PracticeCard({ step, assignment, onComplete, onNext }) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);

    try {
      // Record completion in database
      const { error } = await supabase.from("completions").insert([
        {
          student_id: step.student_id,
          practice_step_id: step.id,
          completed_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      // Show celebration animation
      setShowCelebration(true);

      // Move to next card after celebration
      setTimeout(() => {
        onComplete?.();
        onNext?.();
      }, 2000);
    } catch (err) {
      console.error("Error completing step:", err);
      alert("Failed to save completion. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="practice-card-wrapper">
      <div className={`practice-card ${showCelebration ? "celebrate" : ""}`}>
        <div className="card-header">
          <h2>{assignment.title}</h2>
          <span className="instrument-tag">{assignment.instrument_type}</span>
        </div>

        <div className="card-body">
          <div className="step-counter">
            Step {step.step_number}
          </div>

          <h3 className="step-title">{step.title}</h3>
          <p className="step-description">{step.description}</p>
        </div>

        <div className="card-actions">
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="btn-complete"
          >
            {isCompleting ? "Saving..." : "Mark Complete"}
          </button>
          <button onClick={onNext} disabled={isCompleting} className="btn-skip">
            Skip
          </button>
        </div>
      </div>

      {showCelebration && (
        <div className="celebration">
          <div className="confetti">🎉</div>
          <div className="confetti">⭐</div>
          <div className="confetti">🎵</div>
          <div className="confetti">🏆</div>
          <div className="celebration-text">Great job!</div>
        </div>
      )}
    </div>
  );
}
