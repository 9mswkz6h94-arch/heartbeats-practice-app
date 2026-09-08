import React from "react";
import TeacherWorkspace from "./TeacherWorkspace";
import "./TeacherDashboard.css";

export default function TeacherDashboard({ userId, userEmail, onLogout }) {
  return <TeacherWorkspace teacherId={userId} userEmail={userEmail} onLogout={onLogout} />;
}
