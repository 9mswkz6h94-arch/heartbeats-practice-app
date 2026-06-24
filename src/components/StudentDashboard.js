import React from "react";
import { supabase } from "../lib/supabaseClient";
import StudentPracticeCards from "./StudentPracticeCards";
import StudentRepertoire from "./StudentRepertoire";
import "./Dashboard.css";
import "./StudentDashboard.css";

export default function StudentDashboard({ studentId, onLogout }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Student Dashboard</h1>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>

      <main className="student-dashboard-content">
        <StudentPracticeCards studentId={studentId} />
        <StudentRepertoire studentId={studentId} />
      </main>
    </div>
  );
}
