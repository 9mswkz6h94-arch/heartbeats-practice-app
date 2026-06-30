import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import StudentPracticeCards from "./StudentPracticeCards";
import StudentRepertoire from "./StudentRepertoire";
import "./DevStudentPreview.css";

export default function DevStudentPreview({ teacherId }) {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("students")
        .select("id, name, email")
        .eq("teacher_id", teacherId)
        .order("name");

      if (fetchError) {
        setError("Could not load students");
      } else {
        setStudents(data || []);
      }
      setLoading(false);
    };

    fetchStudents();
  }, [teacherId]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="dev-preview-container">
      <div className="dev-preview-header">
        <h2>🛠 Dev Mode — Preview as Student</h2>
        <p>
          See exactly what a student sees. This is a read-only preview — nothing you do here
          is saved or affects real student data.
        </p>
      </div>

      {error && <div className="dev-preview-error">{error}</div>}

      {!loading && (
        <div className="dev-preview-picker">
          <label htmlFor="dev-student-select">Student</label>
          <select
            id="dev-student-select"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            <option value="">Select a student to preview...</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.email})
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedStudent && (
        <div className="dev-preview-frame">
          <div className="dev-preview-banner">
            🔍 Previewing as <strong>{selectedStudent.name}</strong> — read only, no changes
            are saved
          </div>
          <div className="dev-preview-content" key={selectedStudent.id}>
            <StudentPracticeCards studentId={selectedStudent.id} readOnly />
            <StudentRepertoire studentId={selectedStudent.id} />
          </div>
        </div>
      )}
    </div>
  );
}
