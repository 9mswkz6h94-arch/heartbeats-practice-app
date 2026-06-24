import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import "./TeacherLessonPrepDashboard.css";

export default function TeacherLessonPrepDashboard({ teacherId }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentStats, setStudentStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentsAndStats();
  }, [teacherId]);

  const fetchStudentsAndStats = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all students
      const { data: studentsData, error: studError } = await supabase
        .from("students")
        .select("id, name, email, created_at")
        .eq("teacher_id", teacherId)
        .order("name");

      if (studError) throw studError;

      setStudents(studentsData || []);

      // Fetch stats for each student
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
      // Get completions
      const { data: completions } = await supabase
        .from("completions")
        .select("completed_at")
        .eq("student_id", studentId);

      // Get songs memorized
      const { data: repertoire } = await supabase
        .from("repertoire")
        .select("id")
        .eq("student_id", studentId);

      // Get assignments
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

      // Calculate stats
      const completionList = completions || [];
      const thisWeek = completionList.filter((c) => {
        const date = new Date(c.completed_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
      }).length;

      const uniqueDays = new Set(
        completionList.map((c) => c.completed_at.split("T")[0])
      ).size;

      return {
        completions: completionList.length,
        thisWeek,
        songsMemorized: repertoire?.length || 0,
        streak: uniqueDays,
        assignments: assignments || [],
      };
    } catch (err) {
      console.error("Error fetching student stats:", err);
      return {
        completions: 0,
        thisWeek: 0,
        songsMemorized: 0,
        streak: 0,
        assignments: [],
      };
    }
  };

  if (loading) {
    return <div className="lesson-prep-container"><p>Loading...</p></div>;
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
          <p>Add students to your class to see their progress here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-prep-container">
      <div className="prep-header">
        <h2>Lesson Prep Dashboard</h2>
        <p>This week's student progress at a glance</p>
      </div>

      <div className="prep-content">
        <div className="students-list">
          <h3>Your Students</h3>
          <div className="student-cards">
            {students.map((student) => {
              const stats = studentStats[student.id] || {};
              return (
                <div
                  key={student.id}
                  className={`student-card ${
                    selectedStudent?.id === student.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="student-header">
                    <h4>{student.name}</h4>
                    <span className="practice-count">
                      {stats.thisWeek || 0} this week
                    </span>
                  </div>

                  <div className="student-stats">
                    <div className="stat">
                      <span className="stat-label">Streak</span>
                      <span className="stat-value">🔥 {stats.streak || 0}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Songs</span>
                      <span className="stat-value">🎵 {stats.songsMemorized || 0}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Total</span>
                      <span className="stat-value">✓ {stats.completions || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedStudent && (
          <div className="student-detail">
            <h3>{selectedStudent.name}'s Progress</h3>

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
                  {studentStats[selectedStudent.id].assignments.map(
                    (assignment) => (
                      <div key={assignment.id} className="assignment-item">
                        <div className="assignment-header">
                          <span className="assignment-title">
                            {assignment.title}
                          </span>
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
                    )
                  )}
                </div>
              ) : (
                <p className="no-assignments">No assignments yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
