import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { normalizeAssignmentSteps } from "../lib/lessonMemory";
import {
  instrumentTypes,
  assignmentCategories,
  getCategoryColor,
} from "../lib/practiceTemplates";
import "./AssignmentForm.css";

const BUCKET = "assignment-attachments";

function matchingInstrument(value) {
  if (!value) return "Piano";
  return instrumentTypes.find((type) => value.toLowerCase().includes(type.toLowerCase())) || "Custom";
}

function isMissingAtomicPublishFunction(error) {
  return ["42883", "PGRST202"].includes(error?.code)
    || (
      /publish_assignment_draft/i.test(`${error?.message || ""} ${error?.details || ""}`)
      && /not found|does not exist|could not find/i.test(`${error?.message || ""} ${error?.details || ""}`)
    );
}

export default function AssignmentForm({
  teacherId,
  onAssignmentCreated,
  initialStudentId = "",
  studentName = "",
  lockStudent = false,
  initialDraft = null,
  initialInstrumentType = "Piano",
}) {
  const [title, setTitle] = useState(initialDraft?.title || "");
  const [instrumentType, setInstrumentType] = useState(() => matchingInstrument(initialInstrumentType));
  const [category, setCategory] = useState("pieces");
  const [description, setDescription] = useState(initialDraft?.description || "");
  const [selectedStudent, setSelectedStudent] = useState(initialStudentId);
  const [deadline, setDeadline] = useState("");
  const [students, setStudents] = useState([]);
  const [practiceSteps, setPracticeSteps] = useState(() =>
    normalizeAssignmentSteps(initialDraft?.steps).map((step, index) => ({
      id: `draft-step-${index}`,
      title: step.title,
      description: step.description,
    }))
  );
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (lockStudent) return undefined;
    const fetchStudents = async () => {
      const { data, error: fetchError } = await supabase
        .from("students")
        .select("id, name, email")
        .eq("teacher_id", teacherId)
        .neq("status", "pending");

      if (fetchError) {
        setError("Could not load students");
      } else {
        setStudents(data || []);
      }
    };

    fetchStudents();
    return undefined;
  }, [teacherId, lockStudent]);

  useEffect(() => {
    if (initialStudentId) setSelectedStudent(initialStudentId);
  }, [initialStudentId]);

  const handleAddStep = () => {
    setPracticeSteps([...practiceSteps, { id: Date.now(), title: "", description: "" }]);
  };

  const handleStepChange = (id, field, value) => {
    setPracticeSteps(practiceSteps.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleRemoveStep = (id) => {
    setPracticeSteps(practiceSteps.filter((s) => s.id !== id));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setAttachmentFile(file);
  };

  const handleRemoveFile = () => {
    setAttachmentFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const finishSuccess = (assignment, metadata = {}) => {
    setTitle("");
    setDescription("");
    setDeadline("");
    setCategory("pieces");
    setPracticeSteps([]);
    setAttachmentFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSuccess(true);
    onAssignmentCreated?.(assignment, metadata);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    let createdAssignmentId = null;
    let uploadedAttachmentPath = null;

    try {
      if (!title || !selectedStudent) {
        throw new Error("Please fill in title and select a student");
      }
      if (practiceSteps.some((s) => !s.title.trim())) {
        throw new Error("All practice steps must have a title");
      }

      const stepsForPublish = practiceSteps.length > 0
        ? practiceSteps.map((step) => ({ title: step.title, description: step.description }))
        : [{ title, description }];

      // Upload attachment if provided
      let attachmentUrl = null;
      if (attachmentFile) {
        const ext = attachmentFile.name.split(".").pop();
        const path = `${teacherId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, attachmentFile, { upsert: false });
        if (uploadError) throw new Error("File upload failed: " + uploadError.message);
        uploadedAttachmentPath = path;
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
        attachmentUrl = urlData.publicUrl;
      }

      if (initialDraft?.id) {
        const { data: publishedData, error: publishError } = await supabase.rpc("publish_assignment_draft", {
          p_draft_id: initialDraft.id,
          p_title: title,
          p_description: description,
          p_instrument_type: instrumentType,
          p_category: category,
          p_deadline: deadline || null,
          p_attachment_url: attachmentUrl,
          p_steps: stepsForPublish,
        });

        if (!publishError) {
          const publishedAssignment = Array.isArray(publishedData) ? publishedData[0] : publishedData;
          finishSuccess(publishedAssignment, { draftPublished: true });
          return;
        }

        if (!isMissingAtomicPublishFunction(publishError)) throw publishError;
      }

      // Create assignment
      const { data: assignmentData, error: assignmentError } = await supabase
        .from("assignments")
        .insert([
          {
            teacher_id: teacherId,
            student_id: selectedStudent,
            title,
            description,
            instrument_type: instrumentType,
            category,
            deadline: deadline || null,
            attachment_url: attachmentUrl,
          },
        ])
        .select();

      if (assignmentError) throw assignmentError;

      const assignmentId = assignmentData[0].id;
      createdAssignmentId = assignmentId;

      // The student-facing practice cards are built entirely off
      // practice_steps — an assignment with none would be invisible to the
      // student, with no way to mark it done. When the teacher skips
      // breaking it down, fall back to a single step from the assignment's
      // own title so it still shows up as one completable card.
      const stepsToInsert = stepsForPublish.map((step, index) => ({
        assignment_id: assignmentId,
        step_number: index + 1,
        title: step.title,
        description: step.description,
        sequence_order: index + 1,
      }));

      const { error: stepsError } = await supabase.from("practice_steps").insert(stepsToInsert);
      if (stepsError) throw stepsError;

      // Reset form (keep student selected)
      finishSuccess(assignmentData[0]);
    } catch (err) {
      const cleanupErrors = [];

      if (createdAssignmentId) {
        try {
          const { error: stepsCleanupError } = await supabase
            .from("practice_steps")
            .delete()
            .eq("assignment_id", createdAssignmentId);
          if (stepsCleanupError) cleanupErrors.push("practice steps could not be cleaned up");
        } catch {
          cleanupErrors.push("practice steps could not be cleaned up");
        }

        try {
          const { error: assignmentCleanupError } = await supabase
            .from("assignments")
            .delete()
            .eq("id", createdAssignmentId)
            .eq("teacher_id", teacherId);
          if (assignmentCleanupError) cleanupErrors.push("the draft assignment could not be cleaned up");
        } catch {
          cleanupErrors.push("the draft assignment could not be cleaned up");
        }
      }

      if (uploadedAttachmentPath) {
        try {
          const { error: attachmentCleanupError } = await supabase.storage
            .from(BUCKET)
            .remove([uploadedAttachmentPath]);
          if (attachmentCleanupError) cleanupErrors.push("the uploaded attachment could not be cleaned up");
        } catch {
          cleanupErrors.push("the uploaded attachment could not be cleaned up");
        }
      }

      const cleanupNotice = cleanupErrors.length
        ? ` ${cleanupErrors.join("; ")}.`
        : "";
      setError(`${err.message}${cleanupNotice}`);
    } finally {
      setLoading(false);
    }
  };

  const categoryColor = getCategoryColor(category);

  return (
    <div className="assignment-form-container">
      <h2>Create New Assignment</h2>

      {lockStudent ? (
        <div className="student-selector-sticky" aria-label="Selected student">
          <div className="form-group"><span>Student</span><strong>{studentName}</strong></div>
        </div>
      ) : (
        <div className="student-selector-sticky">
          <div className="form-group">
            <label htmlFor="student">Student *</label>
            <select
              id="student"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              required
              disabled={loading}
              className="sticky-select"
            >
              <option value="">Select a student...</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="assignment-form">
        <div className="form-section">
          <h3>Assignment Details</h3>

          <div className="form-group">
            <label htmlFor="title">Song / Item Name *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Amazing Grace, C Major Scale"
              required
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
                style={{ borderLeftColor: categoryColor, borderLeftWidth: "5px" }}
              >
                {assignmentCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="instrument">Instrument Type</label>
              <select
                id="instrument"
                value={instrumentType}
                onChange={(e) => setInstrumentType(e.target.value)}
                disabled={loading}
              >
                {instrumentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any notes for the student..."
              disabled={loading}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="deadline">Deadline (optional)</label>
            <input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Attachment — Image or PDF (optional)</label>
            <div className={`file-upload-area${attachmentFile ? " has-file" : ""}`}>
              <label className="file-upload-label" htmlFor="attachment">
                <span className="file-upload-icon">{attachmentFile ? "📎" : "📄"}</span>
                <span className="file-upload-text">
                  {attachmentFile ? "Change file" : "Tap to attach an image or PDF"}
                </span>
                <span className="file-upload-hint">JPG, PNG, GIF, or PDF</span>
              </label>
              <input
                id="attachment"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                disabled={loading}
                ref={fileInputRef}
              />
            </div>
            {attachmentFile && (
              <div className="file-selected">
                <span className="file-selected-name">{attachmentFile.name}</span>
                <button
                  type="button"
                  className="btn-remove-file"
                  onClick={handleRemoveFile}
                  disabled={loading}
                >
                  Remove file
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <h3>Practice Steps (optional)</h3>
          <p className="section-info">
            Break this assignment into steps if it's helpful. Leave it empty for a
            single, simple practice card — no breakdown needed.
          </p>

          {practiceSteps.length > 0 && (
            <div className="practice-steps-list">
              {practiceSteps.map((step, index) => (
                <div key={step.id} className="practice-step-item">
                  <div className="step-number-badge">{index + 1}</div>
                  <div className="step-inputs">
                    <input
                      type="text"
                      placeholder="Step title (e.g., Clap rhythm)"
                      value={step.title}
                      onChange={(e) => handleStepChange(step.id, "title", e.target.value)}
                      disabled={loading}
                      className="step-title-input"
                    />
                    <textarea
                      placeholder="Step description (optional)"
                      value={step.description}
                      onChange={(e) => handleStepChange(step.id, "description", e.target.value)}
                      disabled={loading}
                      rows="2"
                      className="step-description-input"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(step.id)}
                    className="btn-remove-step"
                    disabled={loading}
                  >
                    Remove step
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="button" onClick={handleAddStep} className="btn-add-step" disabled={loading}>
            + Add Practice Step
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Assignment created successfully!</div>}

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? "Creating..." : "Create Assignment"}
          </button>
        </div>
      </form>
    </div>
  );
}
