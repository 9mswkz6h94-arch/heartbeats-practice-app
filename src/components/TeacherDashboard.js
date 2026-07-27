import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { isDevUser } from "../lib/devConfig";
import AssignmentForm from "./AssignmentForm";
import TeacherLessonPrepDashboard from "./TeacherLessonPrepDashboard";
import StudentManager from "./StudentManager";
import DevStudentPreview from "./DevStudentPreview";
import "./TeacherDashboard.css";

const VIEW_TITLES = {
  prep: "Studio · today",
  create: "New assignment",
  students: "Students",
  dev: "Student preview",
};

export default function TeacherDashboard({ userId, userEmail, onLogout }) {
  const [activeTab, setActiveTab] = useState("prep");
  const [refresh, setRefresh] = useState(0);
  const devMode = isDevUser(userEmail);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const handleAssignmentCreated = () => {
    setRefresh((prev) => prev + 1);
  };

  const navItems = [
    { id: "prep", label: "Studio", icon: "🎹" },
    { id: "create", label: "New assignment", icon: "＋" },
    { id: "students", label: "Students", icon: "👥" },
    ...(devMode ? [{ id: "dev", label: "Student preview", icon: "🛠" }] : []),
  ];

  return (
    <div className="hud">
      <aside className="hud-sidebar">
        <div className="hud-brand">
          <span className="hud-brand-mark">🎵</span>
          <span className="hud-brand-text">Heart Beats</span>
        </div>

        <nav className="hud-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`hud-nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
              aria-current={activeTab === item.id ? "page" : undefined}
            >
              <span className="hud-nav-icon" aria-hidden="true">{item.icon}</span>
              <span className="hud-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="hud-side-foot">
          <div className="hud-user" title={userEmail}>
            <span className="hud-user-avatar" aria-hidden="true">
              {(userEmail || "?").charAt(0).toUpperCase()}
            </span>
            <span className="hud-user-email">{userEmail}</span>
          </div>
          <button onClick={handleLogout} className="hud-logout">
            Log out
          </button>
        </div>
      </aside>

      <div className="hud-main">
        <header className="hud-topbar">
          <h1 className="hud-view-title">{VIEW_TITLES[activeTab] || "Studio"}</h1>
        </header>

        <div className="hud-content">
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

          {activeTab === "students" && <StudentManager teacherId={userId} />}

          {activeTab === "dev" && devMode && (
            <DevStudentPreview teacherId={userId} />
          )}
        </div>
      </div>
    </div>
  );
}
