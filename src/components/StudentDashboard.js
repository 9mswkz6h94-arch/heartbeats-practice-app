import React from "react";
import { supabase } from "../lib/supabaseClient";
import StudentPracticeCards from "./StudentPracticeCards";
import StudentRepertoire from "./StudentRepertoire";
import SightReading from "./SightReading";
import PetWidget from "./PetWidget";
import PetCollection from "./PetCollection";
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
        <PetWidget studentId={studentId} />
        <PetCollection studentId={studentId} />
        <StudentPracticeCards studentId={studentId} />
        <SightReading studentId={studentId} />
        <StudentRepertoire studentId={studentId} />
      </main>
    </div>
  );
}
