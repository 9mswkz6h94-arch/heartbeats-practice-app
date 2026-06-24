import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { checkAndAwardBadges } from "../lib/badgeLogic";
import PracticeCardDetail from "./PracticeCardDetail";
import "./StudentPracticeCards.css";

export default function StudentPracticeCards({ studentId }) {
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
      const today = getTodayDate();

      // Fetch all assignments with practice steps AND category
      const { data: assignments, error: assignError } = await supabase
        .from("assignments")
        .select(
          `
          id,
          title,
          instrument_type,
          category,
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

      // Fetch today's status for all steps
      const { data: statusData, error: statusError } = await supabase
        .from("daily_practice_status")
        .select("practice_step_id, status")
        .eq("student_id", studentId)
        .eq("date", today);

      if (statusError && statusError.code !== "PGRST116") throw statusError;

      // Create a map of step IDs to their status
      const statusMap = {};
      statusData?.forEach((item) => {
        statusMap[item.practice_step_id] = item.status;
      });

      // Ensure all steps have today's record (create if missing)
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
          });
        });
      });

      // Handle daily resets for non-theory assignments
      const theoryCategory = "theory";
      const oldStatus = await supabase
        .from("daily_practice_status")
        .select("practice_step_id, status")
        .eq("student_id", studentId)
        .lt("date", today);

      // For non-theory assignments from previous days, reset to pending
      if (oldStatus.data) {
        for (const record of oldStatus.data) {
          const step = allSteps.find((s) => s.id === record.practice_step_id);
          if (step && step.category !== theoryCategory && record.status !== "pending") {
            // Reset this non-theory assignment for today
            await supabase
              .from("daily_practice_status")
              .delete()
              .eq("practice_step_id", record.practice_step_id)
              .eq("student_id", studentId)
              .lt("date", today);
          }
        }
      }

      // Create missing daily status records for today
      for (const step of allSteps) {
        if (!statusMap[step.id]) {
          await supabase.from("daily_practice_status").insert([
            {
              student_id: studentId,
              practice_step_id: step.id,
              date: today,
              status: "pending",
            },
          ]);
          statusMap[step.id] = "pending";
        }
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

      // Update daily status to completed (for non-theory, this resets tomorrow)
      await supabase
        .from("daily_practice_status")
        .update({ status: "completed" })
        .eq("student_id", studentId)
        .eq("practice_step_id", step.id)
        .eq("date", today);

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
    } catch (err) {
      console.error("Error completing step:", err);
    }
  };

  const handleStepSkip = async (step) => {
    try {
      const today = getTodayDate();

      // Update daily status to skipped (removes from today's view)
      await supabase
        .from("daily_practice_status")
        .update({ status: "skipped" })
        .eq("student_id", studentId)
        .eq("practice_step_id", step.id)
        .eq("date", today);

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
          }}
          onComplete={() => handleStepComplete(selectedStep)}
          onSkip={() => handleStepSkip(selectedStep)}
          onClose={() => setSelectedStep(null)}
        />
      )}
    </div>
  );
}
