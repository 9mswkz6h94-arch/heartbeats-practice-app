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
    { id: "prep", label: "Studio", index: "01" },
    { id: "create", label: "New assignment", index: "02" },
    { id: "students", label: "Students", index: "03" },
    ...(devMode ? [{ id: "dev", label: "Student preview", index: "04" }] : []),
  ];

  return (
    <div className="hud">
      <aside className="hud-sidebar">
        <div className="hud-brand">
          <span className="hud-brand-mark" aria-hidden="true">HB</span>
          <span><span className="hud-brand-text">Heart Beats</span><span className="hud-brand-context">Teacher workspace</span></span>
        </div>

        <nav className="hud-nav" aria-label="Teacher workspace">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`hud-nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
              aria-current={activeTab === item.id ? "page" : undefined}
            >
              <span className="hud-nav-index" aria-hidden="true">{item.index}</span>
              <span className="hud-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="hud-side-foot">
          <div className="hud-user" title={userEmail}>
            <span className="hud-user-email">{userEmail}</span>
          </div>
          <button type="button" onClick={handleLogout} className="hud-logout">
            Log out
          </button>
        </div>
      </aside>

      <div className="hud-main">
        <header className="hud-topbar">
          <div><p className="hud-view-context">Teacher workspace</p><h1 id="teacher-view-title" className="hud-view-title">{VIEW_TITLES[activeTab] || "Studio"}</h1></div>
        </header>

        <main className="hud-content" aria-labelledby="teacher-view-title">
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
        </main>
      </div>
    </div>
  );
}
