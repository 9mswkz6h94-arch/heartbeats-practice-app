import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { checkAndAwardBadges } from "../lib/badgeLogic";
import {
  fetchStepStatusMap,
  ensureTodayRows,
  cleanupOldDailyRows,
  setStepStatus,
} from "../lib/practiceStatus";
import { cheerForPractice } from "./PetWidget";
import PracticeCardDetail from "./PracticeCardDetail";
import "./StudentPracticeCards.css";

export default function StudentPracticeCards({ studentId, readOnly = false }) {
  const [assignments, setAssignments] = useState([]);
  const [dailyStatus, setDailyStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streak, setStreak] = useState(0);
  const [selectedStep, setSelectedStep] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    fetchAssignmentsAndStatus();
    fetchStreak();
  }, [studentId, refresh]);

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const fetchAssignmentsAndStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all assignments with practice steps AND category
      const { data: assignments, error: assignError } = await supabase
        .from("assignments")
        .select(
          `
          id,
          title,
          instrument_type,
          category,
          attachment_url,
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

      setAssignments(assignments || []);

      const allSteps = [];
      const assignmentMap = {};
      assignments?.forEach((assignment) => {
        assignmentMap[assignment.id] = assignment;
        assignment.practice_steps?.forEach((step) => {
          allSteps.push({
            ...step,
            assignment_id: assignment.id,
            assignment_title: assignment.title,
            instrument_type: assignment.instrument_type,
            category: assignment.category,
            attachment_url: assignment.attachment_url,
          });
        });
      });

      // Daily-category steps reset because there's no row for today yet;
      // Theory steps carry forward their most recent status. See
      // src/lib/practiceStatus.js for why this is gap-length-proof.
      const statusMap = await fetchStepStatusMap(studentId, allSteps);

      if (!readOnly) {
        await ensureTodayRows(studentId, allSteps, statusMap);
        // Best-effort housekeeping — never blocks the practice screen.
        cleanupOldDailyRows(studentId, allSteps).catch((err) =>
          console.error("Daily status cleanup failed (non-fatal):", err)
        );
      } else {
        // Read-only preview: never write daily_practice_status, just default locally
        allSteps.forEach((step) => {
          if (!(step.id in statusMap)) statusMap[step.id] = "pending";
        });
      }

      setDailyStatus(statusMap);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching assignments/status:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStreak = async () => {
    try {
      const { data: completions } = await supabase
        .from("completions")
        .select("completed_at")
        .eq("student_id", studentId)
        .order("completed_at", { ascending: false })
        .limit(365);

      if (completions && completions.length > 0) {
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

  const handleStepComplete = async (step) => {
    if (readOnly) {
      // Preview mode: reflect the action visually, write nothing
      setDailyStatus({ ...dailyStatus, [step.id]: "completed" });
      setSelectedStep(null);
      cheerForPractice();
      return;
    }

    try {
      const today = getTodayDate();

      // Insert completion record (accumulates across all days, never resets)
      await supabase.from("completions").insert([
        {
          student_id: studentId,
          practice_step_id: step.id,
          assignment_id: step.assignment_id,
          completed_at: today,
        },
      ]);

      // Mark today's status completed (for Theory, this is also the row
      // that will keep showing as done on future days until reset).
      await setStepStatus(studentId, step.id, "completed");

      // Update local status
      const newStatus = { ...dailyStatus };
      newStatus[step.id] = "completed";
      setDailyStatus(newStatus);

      // Check badges and refresh streak (based on total completions, not daily)
      setTimeout(async () => {
        await checkAndAwardBadges(studentId);
        await fetchStreak();
      }, 1000);

      setSelectedStep(null);
      cheerForPractice();
    } catch (err) {
      console.error("Error completing step:", err);
    }
  };

  const handleStepSkip = async (step) => {
    if (readOnly) {
      setDailyStatus({ ...dailyStatus, [step.id]: "skipped" });
      setSelectedStep(null);
      return;
    }

    try {
      // Mark today's status skipped (removes from today's view)
      await setStepStatus(studentId, step.id, "skipped");

      // Update local status
      const newStatus = { ...dailyStatus };
      newStatus[step.id] = "skipped";
      setDailyStatus(newStatus);

      setSelectedStep(null);
    } catch (err) {
      console.error("Error skipping step:", err);
    }
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

  // Count remaining (pending) steps for today
  const allSteps = [];
  assignments?.forEach((assignment) => {
    assignment.practice_steps?.forEach((step) => {
      allSteps.push({
        ...step,
        assignment_id: assignment.id,
        assignment_title: assignment.title,
        instrument_type: assignment.instrument_type,
        attachment_url: assignment.attachment_url,
      });
    });
  });

  const remainingCount = allSteps.filter(
    (step) => dailyStatus[step.id] === "pending"
  ).length;
  const totalCount = allSteps.length;

  if (allSteps.length === 0) {
    return (
      <div className="practice-container">
        <div className="empty-state">
          <h2>No practice cards yet</h2>
          <p>Your teacher will assign practice goals for you here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-container">
      <div className="practice-header">
        <div className="header-top">
          <div className="streak-badge">
            <span className="flame">🔥</span>
            <span className="streak-count">{streak} day streak</span>
          </div>

          <div className="counter">
            <span className="remaining">{remainingCount}</span>
            <span className="remaining-label">of {totalCount} remaining today</span>
          </div>
        </div>
      </div>

      {remainingCount === 0 && totalCount > 0 && (
        <div className="celebration-message">
          🎉 You've completed all today's practice! Great work! 🎉
        </div>
      )}

      <div className="practice-grid">
        {allSteps.map((step) => {
          const status = dailyStatus[step.id];
          const isVisible = status === "pending";

          if (!isVisible) return null;

          return (
            <div
              key={step.id}
              className="practice-card-tile"
              onClick={() => setSelectedStep(step)}
            >
              <div className="tile-header">
                <h3>{step.assignment_title}</h3>
                <span className="instrument-tag">{step.instrument_type}</span>
              </div>
              <div className="tile-body">
                <p className="step-title">{step.title}</p>
                <p className="step-number">Step {step.step_number}</p>
              </div>
              <div className="tile-action">
                <span className="tap-hint">Tap to practice →</span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedStep && (
        <PracticeCardDetail
          step={selectedStep}
          assignment={{
            title: selectedStep.assignment_title,
            instrument_type: selectedStep.instrument_type,
            attachment_url: selectedStep.attachment_url,
          }}
          onComplete={() => handleStepComplete(selectedStep)}
          onSkip={() => handleStepSkip(selectedStep)}
          onClose={() => setSelectedStep(null)}
          readOnly={readOnly}
        />
      )}
    </div>
  );
}
