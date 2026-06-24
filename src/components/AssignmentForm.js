import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  instrumentTypes,
  assignmentCategories,
  getCategoryColor,
} from "../lib/practiceTemplates";
import "./AssignmentForm.css";

export default function AssignmentForm({ teacherId, onAssignmentCreated }) {
  const [title, setTitle] = useState("");
  const [instrumentType, setInstrumentType] = useState("Piano");
  const [category, setCategory] = useState("pieces");
  const [description, setDescription] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [deadline, setDeadline] = useState("");
  const [badgeReward, setBadgeReward] = useState("none");
  const [students, setStudents] = useState([]);
  const [practiceSteps, setPracticeSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch students for this teacher
  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error: fetchError } = await supabase
        .from("students")
        .select("id, name, email")
        .eq("teacher_id", teacherId);

      if (fetchError) {
        setError("Could not load students");
      } else {
        setStudents(data || []);
      }
    };

    fetchStudents();
  }, [teacherId]);

  const handleAddStep = () => {
    const newStep = {
      id: Date.now(),
      title: "",
      description: "",
    };
    setPracticeSteps([...practiceSteps, newStep]);
  };

  const handleStepChange = (id, field, value) => {
    const updated = practiceSteps.map((step) =>
      step.id === id ? { ...step, [field]: value } : step
    );
    setPracticeSteps(updated);
  };

  const handleRemoveStep = (id) => {
    setPracticeSteps(practiceSteps.filter((step) => step.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      if (!title || !selectedStudent) {
        throw new Error("Please fill in title and select a student");
      }

      if (practiceSteps.length === 0) {
        throw new Error("Please add at least one practice step");
      }

      // Validate all steps have titles
      if (practiceSteps.some((step) => !step.title.trim())) {
        throw new Error("All practice steps must have a title");
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
          },
        ])
        .select();

      if (assignmentError) throw assignmentError;

      const assignmentId = assignmentData[0].id;

      // Prepare practice steps
      const stepsToInsert = practiceSteps.map((step, index) => ({
        assignment_id: assignmentId,
        step_number: index + 1,
        title: step.title,
        description: step.description,
        sequence_order: index + 1,
      }));

      // Insert practice steps
      const { error: stepsError } = await supabase
        .from("practice_steps")
        .insert(stepsToInsert);

      if (stepsError) throw stepsError;

      // Reset form (but keep student selected for quick multi-assign workflow)
      setTitle("");
      setDescription("");
      setDeadline("");
      setCategory("pieces");
      setBadgeReward("none");
      setPracticeSteps([]);
      setSuccess(true);

      // Notify parent
      onAssignmentCreated?.();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const categoryColor = getCategoryColor(category);

  return (
    <div className="assignment-form-container">
      <h2>Create New Assignment</h2>

      {/* Sticky Student Selector */}
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

      <form onSubmit={handleSubmit} className="assignment-form">
        <div className="form-section">
          <h3>Assignment Details</h3>

          <div className="form-group">
            <label htmlFor="title">Song/Item Name *</label>
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
                style={{
                  borderLeftColor: categoryColor,
                  borderLeftWidth: "4px",
                  paddingLeft: "10px",
                }}
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

          <div className="form-row">
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
              <label htmlFor="badge">Badge Reward (optional)</label>
              <select
                id="badge"
                value={badgeReward}
                onChange={(e) => setBadgeReward(e.target.value)}
                disabled={loading}
              >
                <option value="none">None</option>
                <option value="song">Songs Memorized +1</option>
                <option value="warmup">Warmup Practice</option>
                <option value="custom">Custom Badge</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Practice Steps</h3>
          <p className="section-info">
            Add the practice steps for this assignment. You'll enter them manually.
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
                      onChange={(e) =>
                        handleStepChange(step.id, "title", e.target.value)
                      }
                      disabled={loading}
                      className="step-title-input"
                    />
                    <textarea
                      placeholder="Step description (optional)"
                      value={step.description}
                      onChange={(e) =>
                        handleStepChange(step.id, "description", e.target.value)
                      }
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
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleAddStep}
            className="btn-add-step"
            disabled={loading}
          >
            + Add Practice Step
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            Assignment created successfully!
          </div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? "Creating..." : "Create Assignment"}
          </button>
        </div>
      </form>
    </div>
  );
}
