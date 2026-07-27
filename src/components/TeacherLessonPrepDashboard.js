import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import "./TeacherLessonPrepDashboard.css";

// ── Date helpers (local-day based; timezone-aware refinement is Phase 0c backlog) ──
const dayStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const parseDay = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const daysBetween = (a, b) => Math.round((b - a) / 86400000);

// Real consecutive-day streak: walk backwards from today (or yesterday as anchor).
function computeStreak(daySet) {
  if (daySet.size === 0) return 0;
  const cursor = new Date();
  if (!daySet.has(dayStr(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!daySet.has(dayStr(cursor))) return 0;
  }
  let streak = 0;
  while (daySet.has(dayStr(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// Warm, no-shame triage — surfaces who to reach out to without ever reading as failure.
function triageOf(stats) {
  if (!stats.everPracticed) return { key: "attention", label: "Needs a nudge" };
  if (stats.lastDaysAgo >= 4) return { key: "attention", label: "Needs a nudge" };
  if (stats.streak >= 3) return { key: "streak", label: "On a roll" };
  if (stats.lastDaysAgo === 0) return { key: "active", label: "Practiced today" };
  return { key: "steady", label: "Steady" };
}

const lastPracticedLabel = (stats) => {
  if (!stats.everPracticed) return "no sessions yet";
  if (stats.lastDaysAgo === 0) return "practiced today";
  if (stats.lastDaysAgo === 1) return "yesterday";
  return `${stats.lastDaysAgo}d ago`;
};

export default function TeacherLessonPrepDashboard({ teacherId }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentStats, setStudentStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentsAndStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  const fetchStudentsAndStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: studentsData, error: studError } = await supabase
        .from("students")
        .select("id, name, email, created_at")
        .eq("teacher_id", teacherId)
        .order("name");

      if (studError) throw studError;

      setStudents(studentsData || []);

      const stats = {};
      for (const student of studentsData || []) {
        stats[student.id] = await fetchStudentStats(student.id);
      }
      setStudentStats(stats);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentStats = async (studentId) => {
    try {
      const { data: completions } = await supabase
        .from("completions")
        .select("completed_at")
        .eq("student_id", studentId);

      const { data: repertoire } = await supabase
        .from("repertoire")
        .select("id")
        .eq("student_id", studentId);

      const { data: assignments } = await supabase
        .from("assignments")
        .select(
          `
          id, title, instrument_type, created_at,
          practice_steps(id)
        `
        )
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      const completionList = completions || [];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const thisWeek = completionList.filter(
        (c) => new Date(c.completed_at) >= weekAgo
      ).length;
      const lastWeek = completionList.filter((c) => {
        const d = new Date(c.completed_at);
        return d >= twoWeeksAgo && d < weekAgo;
      }).length;

      const daySet = new Set(
        completionList.map((c) => c.completed_at.split("T")[0])
      );
      const everPracticed = daySet.size > 0;
      const streak = computeStreak(daySet);

      let lastDaysAgo = Infinity;
      if (everPracticed) {
        const latest = [...daySet].sort().pop();
        lastDaysAgo = Math.max(
          0,
          daysBetween(parseDay(latest), parseDay(dayStr(new Date())))
        );
      }

      return {
        completions: completionList.length,
        thisWeek,
        lastWeek,
        songsMemorized: repertoire?.length || 0,
        streak,
        everPracticed,
        lastDaysAgo,
        assignments: assignments || [],
      };
    } catch (err) {
      console.error("Error fetching student stats:", err);
      return {
        completions: 0,
        thisWeek: 0,
        lastWeek: 0,
        songsMemorized: 0,
        streak: 0,
        everPracticed: false,
        lastDaysAgo: Infinity,
        assignments: [],
      };
    }
  };

  if (loading) {
    return <div className="lesson-prep-container"><p>Loading your studio…</p></div>;
  }

  if (error) {
    return (
      <div className="lesson-prep-container">
        <p className="error">Error: {error}</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="lesson-prep-container">
        <div className="empty-state">
          <h2>No students yet</h2>
          <p>Add students to your studio to see their practice at a glance here.</p>
        </div>
      </div>
    );
  }

  // Derive triage + sort so whoever needs a nudge floats to the top.
  const enriched = students.map((s) => {
    const stats = studentStats[s.id] || {};
    return { student: s, stats, triage: triageOf(stats) };
  });
  const rank = (t) => (t.key === "attention" ? 0 : 1);
  enriched.sort(
    (a, b) =>
      rank(a.triage) - rank(b.triage) ||
      a.student.name.localeCompare(b.student.name)
  );

  // Studio pulse.
  const weekSessions = enriched.reduce((sum, e) => sum + (e.stats.thisWeek || 0), 0);
  const lastWeekSessions = enriched.reduce((sum, e) => sum + (e.stats.lastWeek || 0), 0);
  const sessionDelta = weekSessions - lastWeekSessions;
  const needAttention = enriched.filter((e) => e.triage.key === "attention").length;
  const onStreak = enriched.filter((e) => e.triage.key === "streak").length;

  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const newThisMonth = students.filter(
    (s) => s.created_at && new Date(s.created_at) >= monthAgo
  ).length;

  const attentionList = enriched.filter((e) => e.triage.key === "attention");

  const renderSessionDelta = () => {
    if (weekSessions === 0 && lastWeekSessions === 0) return null;
    if (sessionDelta > 0)
      return <span className="pulse-delta up">↑ {sessionDelta} vs last wk</span>;
    if (sessionDelta < 0)
      return (
        <span className="pulse-delta down">↓ {Math.abs(sessionDelta)} vs last wk</span>
      );
    return <span className="pulse-delta flat">even vs last wk</span>;
  };

  return (
    <div className="lesson-prep-container">
      {/* ── Studio pulse ── */}
      <section className="pulse" aria-label="Studio at a glance">
        <div className="pulse-tile t-sessions">
          <div className="pulse-top">
            <span className="pulse-icon" aria-hidden="true">🎵</span>
            {renderSessionDelta()}
          </div>
          <span className="pulse-num">{weekSessions}</span>
          <span className="pulse-lab">sessions this week</span>
        </div>
        <div className={`pulse-tile t-nudge ${needAttention > 0 ? "warm" : ""}`}>
          <div className="pulse-top">
            <span className="pulse-icon" aria-hidden="true">👋</span>
          </div>
          <span className="pulse-num">{needAttention}</span>
          <span className="pulse-lab">
            {needAttention === 1 ? "needs a nudge" : "need a nudge"}
          </span>
        </div>
        <div className="pulse-tile t-roll">
          <div className="pulse-top">
            <span className="pulse-icon" aria-hidden="true">🔥</span>
          </div>
          <span className="pulse-num">{onStreak}</span>
          <span className="pulse-lab">on a roll</span>
        </div>
        <div className="pulse-tile t-students">
          <div className="pulse-top">
            <span className="pulse-icon" aria-hidden="true">👥</span>
            {newThisMonth > 0 && (
              <span className="pulse-delta up">↑ {newThisMonth} this month</span>
            )}
          </div>
          <span className="pulse-num">{students.length}</span>
          <span className="pulse-lab">students</span>
        </div>
      </section>

      <div className="prep-content">
        <div className="students-list">
          <h3 className="list-title">Studio · today</h3>
          <div className="student-cards">
            {enriched.map(({ student, stats, triage }) => (
              <div
                key={student.id}
                className={`triage-card status-${triage.key} ${
                  selectedStudent?.id === student.id ? "selected" : ""
                }`}
                onClick={() => setSelectedStudent(student)}
              >
                <div className="triage-top">
                  <h4>{student.name}</h4>
                  <span className={`triage-pill ${triage.key}`}>{triage.label}</span>
                </div>
                <div className="triage-meta">
                  <span className="tm">
                    <span className="tm-num">🔥 {stats.streak || 0}</span>
                    <span className="tm-lab">day streak</span>
                  </span>
                  <span className="tm">
                    <span className="tm-num">{stats.thisWeek || 0}</span>
                    <span className="tm-lab">this week</span>
                  </span>
                  <span className="tm">
                    <span className="tm-num">{stats.songsMemorized || 0}</span>
                    <span className="tm-lab">songs</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedStudent ? (
          <div className="student-detail">
            <div className="detail-head">
              <h3>{selectedStudent.name}</h3>
              <button
                className="detail-close"
                onClick={() => setSelectedStudent(null)}
                aria-label="Close student detail"
              >
                ✕
              </button>
            </div>

            <div className="detail-stats">
              <div className="detail-stat">
                <label>Sessions This Week</label>
                <div className="detail-value">
                  {studentStats[selectedStudent.id]?.thisWeek || 0}
                </div>
              </div>
              <div className="detail-stat">
                <label>Current Streak</label>
                <div className="detail-value">
                  🔥 {studentStats[selectedStudent.id]?.streak || 0} days
                </div>
              </div>
              <div className="detail-stat">
                <label>Songs Memorized</label>
                <div className="detail-value">
                  {studentStats[selectedStudent.id]?.songsMemorized || 0}
                </div>
              </div>
              <div className="detail-stat">
                <label>Total Completions</label>
                <div className="detail-value">
                  {studentStats[selectedStudent.id]?.completions || 0}
                </div>
              </div>
            </div>

            <div className="assignments-section">
              <h4>Assignments</h4>
              {studentStats[selectedStudent.id]?.assignments?.length ? (
                <div className="assignments-list">
                  {studentStats[selectedStudent.id].assignments.map((assignment) => (
                    <div key={assignment.id} className="assignment-item">
                      <div className="assignment-header">
                        <span className="assignment-title">{assignment.title}</span>
                        <span className="assignment-type">
                          {assignment.instrument_type}
                        </span>
                      </div>
                      <div className="assignment-meta">
                        <span className="assignment-steps">
                          {assignment.practice_steps?.length || 0} steps
                        </span>
                        <span className="assignment-date">
                          {new Date(assignment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <button className="btn-reassign">Reassign</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-assignments">No assignments yet</p>
              )}
            </div>
          </div>
        ) : attentionList.length > 0 ? (
          <div className="attention-panel">
            <h4>👋 Reach out today</h4>
            <div className="attention-list">
              {attentionList.map(({ student, stats }) => (
                <button
                  key={student.id}
                  className="attention-row"
                  onClick={() => setSelectedStudent(student)}
                >
                  <span className="attention-name">{student.name}</span>
                  <span className="attention-when">{lastPracticedLabel(stats)}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="detail-placeholder">
            <span className="dp-emoji" aria-hidden="true">🎉</span>
            <p>Everyone's practiced recently. Select a student to see their details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
