import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { checkAndAwardBadges } from "../lib/badgeLogic";
import {
  fetchStepStatusMap,
  ensureTodayRows,
  cleanupOldDailyRows,
  setStepStatus,
  todayStr,
} from "../lib/practiceStatus";
import { isAssignmentActive } from "../lib/assignmentLifecycle";
import { cheerForPractice } from "./PetWidget";
import { computeStreak } from "../lib/studentStats";
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
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    let midnightTimer;

    const refreshVisiblePractice = () => {
      if (document.visibilityState === "visible") {
        setSelectedStep(null);
        setRefresh((current) => current + 1);
      }
    };

    const scheduleMidnightRefresh = () => {
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        1
      );
      midnightTimer = window.setTimeout(() => {
        setSelectedStep(null);
        setRefresh((current) => current + 1);
        scheduleMidnightRefresh();
      }, nextMidnight.getTime() - now.getTime());
    };

    window.addEventListener("focus", refreshVisiblePractice);
    document.addEventListener("visibilitychange", refreshVisiblePractice);
    scheduleMidnightRefresh();

    return () => {
      window.clearTimeout(midnightTimer);
      window.removeEventListener("focus", refreshVisiblePractice);
      document.removeEventListener("visibilitychange", refreshVisiblePractice);
    };
  }, [studentId]);

  const getTodayDate = () => {
    return todayStr();
  };

  const fetchAssignmentsAndStatus = useCallback(async () => {
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
          deadline,
          memorized,
          archived_at,
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

      // Due dates are inclusive: the card remains available on its due date
      // and falls off the following day. No-date assignments stay active
      // until the teacher resolves them from lesson prep.
      const activeAssignments = (assignments || []).filter((assignment) =>
        isAssignmentActive(assignment)
      );

      setAssignments(activeAssignments);

      const allSteps = [];
      const assignmentMap = {};
      activeAssignments.forEach((assignment) => {
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
        const rejectedStepIds = await ensureTodayRows(studentId, allSteps, statusMap);
        const validSteps = rejectedStepIds?.size
          ? allSteps.filter((step) => !rejectedStepIds.has(step.id))
          : allSteps;

        if (rejectedStepIds?.size) {
          setAssignments(activeAssignments
            .map((assignment) => ({
              ...assignment,
              practice_steps: (assignment.practice_steps || [])
                .filter((step) => !rejectedStepIds.has(step.id)),
            }))
            .filter((assignment) => assignment.practice_steps.length > 0));
        }

        // Best-effort housekeeping — never blocks the practice screen.
        cleanupOldDailyRows(studentId, validSteps).catch((err) =>
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
  }, [readOnly, studentId]);

  const fetchStreak = useCallback(async () => {
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
        setStreak(computeStreak(uniqueDays));
      } else {
        setStreak(0);
      }
    } catch (err) {
      console.error("Error fetching streak:", err);
    }
  }, [studentId]);

  useEffect(() => {
    fetchAssignmentsAndStatus();
    fetchStreak();
  }, [fetchAssignmentsAndStatus, fetchStreak, refresh]);

  const handleStepComplete = async (step) => {
    setActionError(null);
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
      const { error: completionError } = await supabase.from("completions").insert([
        {
          student_id: studentId,
          practice_step_id: step.id,
          assignment_id: step.assignment_id,
          completed_at: today,
        },
      ]);
      if (completionError) throw completionError;

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
      setActionError(
        "That assignment may have just changed. I refreshed your practice cards—please try again."
      );
      setSelectedStep(null);
      setRefresh((current) => current + 1);
    }
  };

  const handleStepSkip = async (step) => {
    setActionError(null);
    if (readOnly) {
      setDailyStatus({ ...dailyStatus, [step.id]: "skipped" });
      setSelectedStep(null);
      cheerForPractice("skip_accepted");
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
      cheerForPractice("skip_accepted");
    } catch (err) {
      console.error("Error skipping step:", err);
      setActionError(
        "That assignment may have just changed. I refreshed your practice cards—please try again."
      );
      setSelectedStep(null);
      setRefresh((current) => current + 1);
    }
  };

  if (loading) {
    return (
      <div className="practice-container">
        <div className="practice-state" role="status"><h2>Loading today’s practice</h2><p>Gathering your practice cards…</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="practice-container">
        <div className="practice-state practice-state-error" role="alert"><h2>Practice cards could not load</h2><p>{error}</p><button type="button" onClick={fetchAssignmentsAndStatus}>Try again</button></div>
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
        <div className="empty-state" role="status">
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
            <span className="streak-label">Current streak</span>
            <span className="streak-count">{streak} days</span>
          </div>

          <div className="counter">
            <span className="remaining">{remainingCount}</span>
            <span className="remaining-label">of {totalCount} remaining today</span>
          </div>
        </div>
      </div>

      {actionError && (
        <p className="error" role="alert">
          {actionError}
        </p>
      )}

      {remainingCount === 0 && totalCount > 0 && (
        <div className="celebration-message" role="status">
          <strong>Today’s practice is complete.</strong> Great work!
        </div>
      )}

      <div className="practice-grid">
        {allSteps.map((step) => {
          const status = dailyStatus[step.id];
          const isVisible = status === "pending";

          if (!isVisible) return null;

          return (
            <button
              type="button"
              key={step.id}
              className="practice-card-tile"
              onClick={() => {
                setActionError(null);
                setSelectedStep(step);
              }}
            >
              <span className="tile-header">
                <span className="tile-assignment-title">{step.assignment_title}</span>
                <span className="instrument-tag">{step.instrument_type}</span>
              </span>
              <span className="tile-body">
                <span className="step-title">{step.title}</span>
                <span className="step-number">Step {step.step_number}</span>
              </span>
              <span className="tile-action"><span className="tap-hint">Open practice card</span></span>
            </button>
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
