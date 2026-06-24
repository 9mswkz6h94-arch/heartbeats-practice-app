import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { practiceTemplates, instrumentTypes } from "../lib/practiceTemplates";
import "./AssignmentForm.css";

export default function AssignmentForm({ teacherId, onAssignmentCreated }) {
  const [title, setTitle] = useState("");
  const [instrumentType, setInstrumentType] = useState("Piano");
  const [description, setDescription] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [deadline, setDeadline] = useState("");
  const [badgeReward, setBadgeReward] = useState("none");
  const [students, setStudents] = useState([]);
  const [practiceSteps, setPracticeSteps] = useState(
    practiceTemplates.Piano
  );
  const [customSteps, setCustomSteps] = useState([]);
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

  // Update practice steps when instrument changes
  useEffect(() => {
    const template = practiceTemplates[instrumentType] || [];
    setPracticeSteps(template);
    setCustomSteps([]);
  }, [instrumentType]);

  const handleAddCustomStep = () => {
    const newStep = {
      step_number: practiceSteps.length + customSteps.length + 1,
      title: "",
      description: "",
      isCustom: true,
    };
    setCustomSteps([...customSteps, newStep]);
  };

  const handleCustomStepChange = (index, field, value) => {
    const updated = [...customSteps];
    updated[index][field] = value;
    setCustomSteps(updated);
  };

  const handleRemoveCustomStep = (index) => {
    setCustomSteps(customSteps.filter((_, i) => i !== index));
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
            deadline: deadline || null,
          },
        ])
        .select();

      if (assignmentError) throw assignmentError;

      const assignmentId = assignmentData[0].id;

      // Prepare all practice steps (template + custom)
      const allSteps = [
        ...practiceSteps.map((step, index) => ({
          ...step,
          assignment_id: assignmentId,
          sequence_order: index + 1,
        })),
        ...customSteps.map((step, index) => ({
          assignment_id: assignmentId,
          step_number: practiceSteps.length + index + 1,
          title: step.title,
          description: step.description,
          sequence_order: practiceSteps.length + index + 1,
        })),
      ];

      // Insert practice steps
      const { error: stepsError } = await supabase
        .from("practice_steps")
        .insert(allSteps);

      if (stepsError) throw stepsError;

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedStudent("");
      setDeadline("");
      setBadgeReward("none");
      setCustomSteps([]);
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

  return (
    <div className="assignment-form-container">
      <h2>Create New Assignment</h2>

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

            <div className="form-group">
              <label htmlFor="student">Assign To Student *</label>
              <select
                id="student"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                required
                disabled={loading}
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
            {instrumentType === "Custom"
              ? "Add your own practice steps"
              : `Auto-generated for ${instrumentType}. Add custom steps below or modify as needed.`}
          </p>

          <div className="steps-preview">
            {practiceSteps.map((step, index) => (
              <div key={index} className="step-item">
                <div className="step-number">{step.step_number}</div>
                <div className="step-content">
                  <div className="step-title">{step.title}</div>
                  <div className="step-description">{step.description}</div>
                </div>
              </div>
            ))}
          </div>

          {customSteps.length > 0 && (
            <div className="custom-steps">
              <h4>Custom Steps</h4>
              {customSteps.map((step, index) => (
                <div key={index} className="custom-step-form">
                  <input
                    type="text"
                    placeholder="Step title"
                    value={step.title}
                    onChange={(e) =>
                      handleCustomStepChange(index, "title", e.target.value)
                    }
                    disabled={loading}
                  />
                  <textarea
                    placeholder="Step description"
                    value={step.description}
                    onChange={(e) =>
                      handleCustomStepChange(index, "description", e.target.value)
                    }
                    disabled={loading}
                    rows="2"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomStep(index)}
                    className="btn-remove"
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleAddCustomStep}
            className="btn-add-step"
            disabled={loading}
          >
            + Add Custom Step
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            Assignment created successfully!
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
            className="btn-submit"
          >
            {loading ? "Creating..." : "Create Assignment"}
          </button>
        </div>
      </form>
    </div>
  );
}
