import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import "./AssignmentList.css";

export default function AssignmentList({ teacherId, refresh }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, [teacherId, refresh]);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("assignments")
        .select(
          `
          id,
          title,
          instrument_type,
          deadline,
          created_at,
          students(name, email)
        `
        )
        .eq("teacher_id", teacherId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setAssignments(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "No deadline";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return <div className="assignment-list"><p>Loading assignments...</p></div>;
  }

  if (error) {
    return (
      <div className="assignment-list">
        <p className="error">Error loading assignments: {error}</p>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="assignment-list">
        <p className="empty-state">No assignments yet. Create one above!</p>
      </div>
    );
  }

  return (
    <div className="assignment-list">
      <h3>Recent Assignments</h3>
      <div className="assignments-grid">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="assignment-card">
            <div className="card-header">
              <h4>{assignment.title}</h4>
              <span className="instrument-badge">
                {assignment.instrument_type}
              </span>
            </div>

            <div className="card-body">
              <div className="assignment-info">
                <label>Student:</label>
                <p>{assignment.students?.name || "Unknown"}</p>
              </div>

              <div className="assignment-info">
                <label>Deadline:</label>
                <p
                  className={isOverdue(assignment.deadline) ? "overdue" : ""}
                >
                  {formatDate(assignment.deadline)}
                </p>
              </div>

              <div className="assignment-info">
                <label>Created:</label>
                <p>{formatDate(assignment.created_at)}</p>
              </div>
            </div>

            <div className="card-actions">
              <button className="btn-view">View Details</button>
              <button className="btn-edit">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
