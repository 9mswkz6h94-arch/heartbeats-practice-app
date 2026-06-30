import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import "./StudentManager.css";

export default function StudentManager({ teacherId }) {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [teacherId]);

  const fetchStudents = async () => {
    setFetching(true);
    const { data, error: fetchError } = await supabase
      .from("students")
      .select("id, name, email, auth_user_id, created_at")
      .eq("teacher_id", teacherId)
      .order("name");

    if (fetchError) {
      setError("Could not load students");
    } else {
      setStudents(data || []);
    }
    setFetching(false);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      if (!name.trim() || !email.trim()) {
        throw new Error("Please enter a name and email");
      }

      const { error: insertError } = await supabase
        .from("students")
        .insert([{ teacher_id: teacherId, name: name.trim(), email: email.trim() }]);

      if (insertError) throw insertError;

      setName("");
      setEmail("");
      setSuccess(true);
      fetchStudents();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Remove this student? Their assignments and history will also be deleted.")) {
      return;
    }
    await supabase.from("students").delete().eq("id", studentId);
    fetchStudents();
  };

  return (
    <div className="student-manager-container">
      <div className="student-manager-form-section">
        <h2>Add a Student</h2>
        <p className="section-info">
          Add the student's name and the email they'll use to log in. They can sign up with
          this email at rainbowheart.studio/login once you've added them here.
        </p>

        <form onSubmit={handleAddStudent} className="student-manager-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="student-name">Name *</label>
              <input
                id="student-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Emma Rodriguez"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="student-email">Email *</label>
              <input
                id="student-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                disabled={loading}
                required
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">Student added!</div>}

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Adding..." : "+ Add Student"}
            </button>
          </div>
        </form>
      </div>

      <div className="student-manager-list-section">
        <h3>Your Students ({students.length})</h3>

        {fetching && <p className="loading">Loading students...</p>}

        {!fetching && students.length === 0 && (
          <div className="empty-state">
            <p>No students yet. Add your first one above.</p>
          </div>
        )}

        {!fetching && students.length > 0 && (
          <div className="student-manager-list">
            {students.map((student) => (
              <div key={student.id} className="student-manager-row">
                <div className="student-manager-info">
                  <span className="student-manager-name">{student.name}</span>
                  <span className="student-manager-email">{student.email}</span>
                </div>
                <span
                  className={`student-manager-status ${student.auth_user_id ? "linked" : "pending"}`}
                >
                  {student.auth_user_id ? "✓ Account linked" : "Awaiting first login"}
                </span>
                <button
                  className="btn-remove-student"
                  onClick={() => handleRemoveStudent(student.id)}
                  title="Remove student"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
