import React from "react";
import { supabase } from "../lib/supabaseClient";
import "./Dashboard.css";

export default function TeacherDashboard({ userId, onLogout }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🏫 Teacher Dashboard</h1>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <div className="status-card">
          <h2>✅ Auth Connected!</h2>
          <p>Teacher ID: {userId.substring(0, 8)}...</p>
          <p>Your dashboard is loading. Check back soon for:</p>
          <ul>
            <li>📝 Create assignments</li>
            <li>👥 Manage students</li>
            <li>📊 View progress</li>
            <li>🏆 Assign badges</li>
          </ul>
        </div>

        <div className="next-steps">
          <h3>🚀 Next Steps</h3>
          <p>Sprint 2 will add:</p>
          <ul>
            <li>Assignment creation form</li>
            <li>Student management</li>
            <li>Lesson prep dashboard</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
