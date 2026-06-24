import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { checkAndAwardBadges } from "../lib/badgeLogic";
import PracticeCard from "./PracticeCard";
import "./StudentPracticeCards.css";

export default function StudentPracticeCards({ studentId }) {
  const [practiceSteps, setPracticeSteps] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streak, setStreak] = useState(0);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    fetchPracticeSteps();
    fetchStreak();
  }, [studentId, refresh]);

  const fetchPracticeSteps = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all assignments for this student with their practice steps
      const { data: assignments, error: assignError } = await supabase
        .from("assignments")
        .select(
          `
          id,
          title,
          instrument_type,
          student_id,
          practice_steps(
            id,
            step_number,
            title,
            description,
            sequence_order
          )
        `
        )
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      if (assignError) throw assignError;

      // Flatten the structure to get all practice steps with assignment info
      const allSteps = [];
      assignments?.forEach((assignment) => {
        assignment.practice_steps?.forEach((step) => {
          allSteps.push({
            ...step,
            student_id: studentId,
            assignment_id: assignment.id,
            assignment_title: assignment.title,
            instrument_type: assignment.instrument_type,
          });
        });
      });

      setPracticeSteps(allSteps);
      setCurrentIndex(0);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching practice steps:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStreak = async () => {
    try {
      // Get today's date
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];

      // Check if student practiced today
      const { data: todayData } = await supabase
        .from("completions")
        .select("id")
        .eq("student_id", studentId)
        .gte("completed_at", today)
        .limit(1);

      // Calculate streak (simplified: just count consecutive days with practice)
      const { data: completions } = await supabase
        .from("completions")
        .select("completed_at")
        .eq("student_id", studentId)
        .order("completed_at", { ascending: false })
        .limit(365);

      if (completions && completions.length > 0) {
        // For MVP, just count unique days practiced
        const uniqueDays = new Set(
          completions.map((c) => c.completed_at.split("T")[0])
        );
        setStreak(uniqueDays.size);
      } else {
        setStreak(0);
      }
    } catch (err) {
      console.error("Error fetching streak:", err);
    }
  };

  const handleNext = () => {
    if (currentIndex < practiceSteps.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleComplete = () => {
    // Check for new badges
    setTimeout(async () => {
      await checkAndAwardBadges(studentId);
      fetchStreak();
    }, 1000);
  };

  if (loading) {
    return (
      <div className="practice-container">
        <p className="loading">Loading practice cards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="practice-container">
        <p className="error">Error loading practice cards: {error}</p>
      </div>
    );
  }

  if (practiceSteps.length === 0) {
    return (
      <div className="practice-container">
        <div className="empty-state">
          <h2>No practice cards yet</h2>
          <p>Your teacher will assign practice goals for you here!</p>
        </div>
      </div>
    );
  }

  const currentStep = practiceSteps[currentIndex];

  return (
    <div className="practice-container">
      <div className="practice-header">
        <div className="streak-badge">
          <span className="flame">🔥</span>
          <span className="streak-count">{streak} day streak</span>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${((currentIndex + 1) / practiceSteps.length) * 100}%`,
            }}
          />
        </div>
        <p className="progress-text">
          Card {currentIndex + 1} of {practiceSteps.length}
        </p>
      </div>

      <div className="card-display">
        <PracticeCard
          step={currentStep}
          assignment={{
            title: currentStep.assignment_title,
            instrument_type: currentStep.instrument_type,
          }}
          onComplete={handleComplete}
          onNext={handleNext}
        />
      </div>

      <div className="navigation">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="nav-btn"
        >
          Previous
        </button>

        <span className="nav-info">
          {currentIndex + 1} / {practiceSteps.length}
        </span>

        <button
          onClick={handleNext}
          disabled={currentIndex === practiceSteps.length - 1}
          className="nav-btn"
        >
          Next
        </button>
      </div>
    </div>
  );
}
