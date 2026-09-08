import React from "react";
import StudentPracticeCards from "./StudentPracticeCards";
import StudentRepertoire from "./StudentRepertoire";
import StudentZooExperience from "./StudentZooExperience";
import BadgeShowcase from "./BadgeShowcase";
import "./Dashboard.css";
import "./StudentDashboard.css";

export default function StudentDashboard({ studentId, onLogout }) {
  return (
    <div className="dashboard rainbow-heart-student-review">
      <header className="dashboard-header">
        <div><p className="dashboard-context">Student workspace</p><h1>Today’s practice</h1></div>
        <button type="button" onClick={onLogout} className="btn-logout">
          Switch account
        </button>
      </header>

      <main className="student-dashboard-content">
        <StudentZooExperience studentId={studentId} />
        <StudentPracticeCards studentId={studentId} />
        <BadgeShowcase studentId={studentId} />
        <StudentRepertoire studentId={studentId} />
      </main>
    </div>
  );
}
