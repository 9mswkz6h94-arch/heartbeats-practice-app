import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AssignmentForm from "./AssignmentForm";
import AssignmentList from "./AssignmentList";
import "./Dashboard.css";
import "./TeacherDashboard.css";

export default function TeacherDashboard({ userId, onLogout }) {
  const [refresh, setRefresh] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const handleAssignmentCreated = () => {
    setRefresh((prev) => prev + 1);
    setShowForm(false);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>

      <main className="teacher-dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Create Assignment</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-toggle-form"
            >
              {showForm ? "Hide Form" : "New Assignment"}
            </button>
          </div>

          {showForm ? (
            <AssignmentForm
              teacherId={userId}
              onAssignmentCreated={handleAssignmentCreated}
            />
          ) : (
            <div className="form-placeholder">
              <p>Click "New Assignment" to create an assignment for your students.</p>
            </div>
          )}

          <AssignmentList teacherId={userId} refresh={refresh} />
        </div>
      </main>
    </div>
  );
}
