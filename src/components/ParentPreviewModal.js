import React, { useEffect, useRef } from "react";
import KidPracticePanel from "./KidPracticePanel";
import "./ParentPreviewModal.css";

// Full-screen overlay showing exactly what a student's parent sees,
// read-only, using the teacher's own (already-authorized) session.
export default function ParentPreviewModal({ student, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!student) return undefined;
    const previouslyFocused = document.activeElement;
    closeRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll(
        'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [student, onClose]);

  if (!student) return null;
  return (
    <div className="preview-overlay" onClick={onClose}>
      <div ref={dialogRef} className="preview-modal" role="dialog" aria-modal="true" aria-labelledby="parent-preview-title" onClick={(e) => e.stopPropagation()}>
        <div className="preview-modal-header">
          <span id="parent-preview-title">Previewing as {student.name}'s parent</span>
          <button ref={closeRef} type="button" className="preview-modal-close" onClick={onClose}>Close</button>
        </div>
        <div className="preview-modal-body">
          <KidPracticePanel kid={student} mode="teacher-preview" />
        </div>
      </div>
    </div>
  );
}
