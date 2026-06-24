import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AssignmentForm from "./AssignmentForm";
import TeacherLessonPrepDashboard from "./TeacherLessonPrepDashboard";
import "./Dashboard.css";
import "./TeacherDashboard.css";

export default function TeacherDashboard({ userId, onLogout }) {
  const [activeTab, setActiveTab] = useState("prep");
  const [refresh, setRefresh] = useState(0);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const handleAssignmentCreated = () => {
    setRefresh((prev) => prev + 1);
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
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === "prep" ? "active" : ""}`}
            onClick={() => setActiveTab("prep")}
          >
            Lesson Prep
          </button>
          <button
            className={`tab-btn ${activeTab === "create" ? "active" : ""}`}
            onClick={() => setActiveTab("create")}
          >
            Create Assignment
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "prep" && (
            <TeacherLessonPrepDashboard teacherId={userId} key={refresh} />
          )}

          {activeTab === "create" && (
            <div className="create-assignment-section">
              <AssignmentForm
                teacherId={userId}
                onAssignmentCreated={handleAssignmentCreated}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
