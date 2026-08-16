import React from "react";
import KidPracticePanel from "./KidPracticePanel";
import "./ParentPreviewModal.css";

// Full-screen overlay showing exactly what a student's parent sees,
// read-only, using the teacher's own (already-authorized) session.
export default function ParentPreviewModal({ student, onClose }) {
  if (!student) return null;
  return (
    <div className="preview-overlay" onClick={onClose}>
      <div className="preview-modal" role="dialog" aria-modal="true" aria-labelledby="parent-preview-title" onClick={(e) => e.stopPropagation()}>
        <div className="preview-modal-header">
          <span id="parent-preview-title">Previewing as {student.name}'s parent</span>
          <button type="button" className="preview-modal-close" onClick={onClose}>Close</button>
        </div>
        <div className="preview-modal-body">
          <KidPracticePanel kid={student} mode="teacher-preview" />
        </div>
      </div>
    </div>
  );
}
