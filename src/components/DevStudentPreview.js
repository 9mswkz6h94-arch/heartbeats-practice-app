import React, { useState, useEffect, useMemo } from "react";
import StudentPracticeCards from "./StudentPracticeCards";
import StudentRepertoire from "./StudentRepertoire";
import PetWidget from "./PetWidget";
import PetCollection from "./PetCollection";
import BadgeShowcase from "./BadgeShowcase";
import { createStudentPreviewApi } from "../lib/studentPreview";
import "./DevStudentPreview.css";

export function previewContentState({ loading, error, student } = {}) {
  return !loading && !error && Boolean(student);
}

export default function DevStudentPreview({ teacherId, studentId: requestedStudentId = "", onExit, api: providedApi }) {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(requestedStudentId);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = useMemo(() => providedApi || createStudentPreviewApi(), [providedApi]);

  useEffect(() => {
    let active = true;
    const fetchPreviewStudent = async () => {
      setLoading(true);
      setError(null);
      setSelectedStudent(null);
      setSelectedStudentId(requestedStudentId || "");
      try {
        if (requestedStudentId) {
          const student = await api.getAuthorizedStudent(teacherId, requestedStudentId);
          if (active) setSelectedStudent(student);
        } else {
          const availableStudents = await api.listAuthorizedStudents(teacherId);
          if (active) setStudents(availableStudents);
        }
      } catch (fetchError) {
        if (active) setError(fetchError.message || "Could not load the student preview.");
      }
      if (active) setLoading(false);
    };

    fetchPreviewStudent();
    return () => { active = false; };
  }, [api, requestedStudentId, teacherId]);

  const activeStudent = requestedStudentId
    ? selectedStudent
    : students.find((student) => student.id === selectedStudentId);

  const selectStudent = (event) => {
    setSelectedStudentId(event.target.value);
    setSelectedStudent(null);
  };

  return (
    <div className="dev-preview-container teacher-student-preview">
      <div className="dev-preview-header">
        <div className="dev-preview-header-row">
          <div><p className="dev-preview-kicker">Teacher-only, read-only</p><h2>View as student</h2></div>
          {onExit && <button type="button" className="dev-preview-exit" onClick={onExit}>Return to teacher workspace</button>}
        </div>
        <p>See the student-facing assignment view without signing out. Practice actions, rewards, messages, and account changes are disabled.</p>
      </div>

      {error && <div className="dev-preview-error" role="alert"><strong>Student preview could not load</strong><span>{error}</span>{onExit && <button type="button" onClick={onExit}>Return to teacher workspace</button>}</div>}

      {!loading && !requestedStudentId && (
        <div className="dev-preview-picker">
          <label htmlFor="dev-student-select">Student</label>
          <select
            id="dev-student-select"
            value={selectedStudentId}
            onChange={selectStudent}
          >
            <option value="">Select a student to preview...</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}{student.instrument ? ` · ${student.instrument}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && <div className="dev-preview-empty" role="status">Loading the student-facing view…</div>}

      {previewContentState({ loading, error, student: activeStudent }) && (
        <div className="dev-preview-frame">
          <div className="dev-preview-banner" role="status"><strong>Previewing {activeStudent.name}</strong><span>Read only · nothing here is saved</span></div>
          <div className="dev-preview-content" key={activeStudent.id}>
            <PetWidget studentId={activeStudent.id} readOnly />
            <PetCollection studentId={activeStudent.id} readOnly />
            <StudentPracticeCards studentId={activeStudent.id} readOnly />
            <BadgeShowcase studentId={activeStudent.id} />
            <StudentRepertoire studentId={activeStudent.id} />
          </div>
        </div>
      )}

      {!loading && !error && !activeStudent && !requestedStudentId && <div className="dev-preview-empty" role="status">Choose a student to open their read-only view.</div>}
    </div>
  );
}
