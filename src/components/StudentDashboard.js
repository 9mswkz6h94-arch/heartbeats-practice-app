import React from "react";
import { supabase } from "../lib/supabaseClient";
import "./Dashboard.css";

export default function StudentDashboard({ studentId, onLogout }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🎓 Student Dashboard</h1>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <div className="status-card">
          <h2>✅ Auth Connected!</h2>
          <p>Student ID: {studentId.substring(0, 8)}...</p>
          <p>Your practice dashboard is loading. Soon you'll see:</p>
          <ul>
            <li>🎵 Practice cards</li>
            <li>🔥 Streak counter</li>
            <li>🏆 Badges earned</li>
            <li>📚 Your repertoire</li>
          </ul>
        </div>

        <div className="next-steps">
          <h3>🚀 Coming in Sprint 3</h3>
          <p>Your personalized practice experience:</p>
          <ul>
            <li>Duolingo-style practice cards</li>
            <li>Real-time streak tracking</li>
            <li>Repertoire builder</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
