import React, { useState } from "react";
import { calculateAge } from "../lib/familyProfile";
import "./FamilySetupFixture.css";

export { calculateAge } from "../lib/familyProfile";

const AVATARS = ["🎹", "🎸", "🎤", "🥁", "🎻", "🎺"];
const INSTRUMENTS = ["Piano", "Guitar", "Ukulele", "Voice", "Drums", "Other"];

function gradeLabel(grade) {
  if (grade === 1) return "1st grade";
  if (grade === 2) return "2nd grade";
  if (grade === 3) return "3rd grade";
  return `${grade}th grade`;
}

function blankStudent(id) {
  return {
    id,
    fullName: "",
    preferredName: "",
    birthday: "",
    pronouns: "",
    grade: "",
    instrument: "Piano",
    pin: "",
    avatar: "🎹",
  };
}

function blankGuardian(id) {
  return {
    id,
    name: "",
    relationship: "Parent",
    email: "",
    phone: "",
    canManage: true,
  };
}

export default function FamilySetupFixture() {
  const [students, setStudents] = useState([{
    ...blankStudent("student-1"),
    fullName: "Alexandria Montgomery-Rivera",
    preferredName: "Alex",
    birthday: "2016-10-14",
    pronouns: "they / them",
    grade: "4",
    instrument: "Piano",
    pin: "4827",
  }]);
  const [guardians, setGuardians] = useState([{
    ...blankGuardian("guardian-1"),
    name: "Jordan Rivera",
    email: "jordan@example.com",
    phone: "(512) 555-0147",
  }]);
  const [saved, setSaved] = useState(false);

  const updateStudent = (id, patch) => {
    setSaved(false);
    setStudents((current) => current.map((student) => (
      student.id === id ? { ...student, ...patch } : student
    )));
  };

  const updateGuardian = (id, patch) => {
    setSaved(false);
    setGuardians((current) => current.map((guardian) => (
      guardian.id === id ? { ...guardian, ...patch } : guardian
    )));
  };

  const addStudent = () => {
    setSaved(false);
    setStudents((current) => [
      ...current,
      blankStudent(`student-${Date.now()}`),
    ]);
  };

  const addGuardian = () => {
    setSaved(false);
    setGuardians((current) => [
      ...current,
      blankGuardian(`guardian-${Date.now()}`),
    ]);
  };

  const removeStudent = (id) => {
    setSaved(false);
    setStudents((current) => current.filter((student) => student.id !== id));
  };

  const removeGuardian = (id) => {
    setSaved(false);
    setGuardians((current) => current.filter((guardian) => guardian.id !== id));
  };

  return (
    <main className="family-setup-preview">
      <header className="family-setup-heading">
        <div>
          <p className="family-setup-kicker">Family onboarding · 02</p>
          <h1>Tell us about your family</h1>
          <p className="family-setup-intro">
            Add the students who practice here and the grown-ups who help them.
            You can change any of this later.
          </p>
        </div>
        <div className="family-setup-privacy" role="note">
          <strong>Private family information</strong>
          <span>Birthdays and contact details are visible only to your family and the studio team.</span>
        </div>
      </header>

      <ol className="family-setup-progress" aria-label="Family setup progress">
        <li className="complete"><span>01</span><strong>Account</strong><small>Complete</small></li>
        <li className="current" aria-current="step"><span>02</span><strong>Family</strong><small>In progress</small></li>
        <li><span>03</span><strong>Review</strong><small>Up next</small></li>
      </ol>

      <form
        className="family-setup-layout"
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <div className="family-setup-form-column">
          <section className="family-form-section" aria-labelledby="student-section-title">
            <div className="family-section-heading">
              <div>
                <p className="family-section-index">A · Students</p>
                <h2 id="student-section-title">Who will be practicing?</h2>
                <p>Add siblings as separate student profiles so each person gets their own work and progress.</p>
              </div>
              <span className="family-count">{students.length} {students.length === 1 ? "student" : "students"}</span>
            </div>

            <div className="family-card-stack">
              {students.map((student, index) => {
                const age = calculateAge(student.birthday);
                return (
                  <fieldset className="family-person-card student-person-card" key={student.id}>
                    <legend className="family-person-legend">
                      <span className="family-person-number">{String(index + 1).padStart(2, "0")}</span>
                      <span>{student.preferredName || student.fullName || `Student ${index + 1}`}</span>
                      {student.birthday && <span className="family-age-chip">Age {age}</span>}
                    </legend>

                    {students.length > 1 && (
                      <button
                        type="button"
                        className="family-remove-button"
                        onClick={() => removeStudent(student.id)}
                        aria-label={`Remove student ${index + 1}`}
                      >
                        Remove
                      </button>
                    )}

                    <div className="family-field-grid">
                      <label className="family-field family-field-wide">
                        <span>Full name</span>
                        <input
                          value={student.fullName}
                          onChange={(event) => updateStudent(student.id, { fullName: event.target.value })}
                          placeholder="Student’s full name"
                          autoComplete="name"
                          required
                        />
                      </label>

                      <label className="family-field">
                        <span>What should we call them?</span>
                        <input
                          value={student.preferredName}
                          onChange={(event) => updateStudent(student.id, { preferredName: event.target.value })}
                          placeholder="Preferred name"
                        />
                      </label>

                      <label className="family-field">
                        <span>Pronouns <em>Optional</em></span>
                        <input
                          value={student.pronouns}
                          onChange={(event) => updateStudent(student.id, { pronouns: event.target.value })}
                          placeholder="e.g., she / her"
                        />
                      </label>

                      <label className="family-field">
                        <span>Birthday</span>
                        <input
                          type="date"
                          value={student.birthday}
                          onChange={(event) => updateStudent(student.id, { birthday: event.target.value })}
                          required
                        />
                      </label>

                      <label className="family-field family-age-field">
                        <span>Age</span>
                        <output aria-live="polite">{student.birthday ? `${age} years old` : "Calculated from birthday"}</output>
                      </label>

                      <label className="family-field">
                        <span>Grade <em>Optional</em></span>
                        <select
                          value={student.grade}
                          onChange={(event) => updateStudent(student.id, { grade: event.target.value })}
                        >
                          <option value="">Choose grade</option>
                          <option value="Pre-K">Pre-K</option>
                          <option value="K">Kindergarten</option>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                            <option key={grade} value={grade}>{gradeLabel(grade)}</option>
                          ))}
                          <option value="Adult">Adult learner</option>
                        </select>
                      </label>

                      <label className="family-field">
                        <span>Primary instrument</span>
                        <select
                          value={student.instrument}
                          onChange={(event) => updateStudent(student.id, { instrument: event.target.value })}
                        >
                          {INSTRUMENTS.map((instrument) => <option key={instrument}>{instrument}</option>)}
                        </select>
                      </label>

                      <label className="family-field">
                        <span>Student PIN</span>
                        <input
                          value={student.pin}
                          onChange={(event) => updateStudent(student.id, {
                            pin: event.target.value.replace(/\D/g, "").slice(0, 4),
                          })}
                          placeholder="4 digits"
                          inputMode="numeric"
                          pattern="\d{4}"
                          maxLength={4}
                          required
                        />
                        <small>Used with the family code—no student email needed.</small>
                      </label>
                    </div>

                    <div className="family-avatar-field">
                      <span>Choose their sign-in picture</span>
                      <div className="family-avatar-options">
                        {AVATARS.map((avatar) => (
                          <button
                            type="button"
                            key={avatar}
                            className={student.avatar === avatar ? "selected" : ""}
                            aria-pressed={student.avatar === avatar}
                            aria-label={`Use ${avatar} for ${student.preferredName || `student ${index + 1}`}`}
                            onClick={() => updateStudent(student.id, { avatar })}
                          >
                            {avatar}
                          </button>
                        ))}
                      </div>
                    </div>
                  </fieldset>
                );
              })}
            </div>

            <button type="button" className="family-add-button" onClick={addStudent}>
              <span>+</span> Add another student
            </button>
          </section>

          <section className="family-form-section" aria-labelledby="guardian-section-title">
            <div className="family-section-heading">
              <div>
                <p className="family-section-index">B · Guardians & caregivers</p>
                <h2 id="guardian-section-title">Who helps with music at home?</h2>
                <p>Guardians can see schedules, practice progress, and messages from the studio.</p>
              </div>
              <span className="family-count">{guardians.length} {guardians.length === 1 ? "guardian" : "guardians"}</span>
            </div>

            <div className="family-card-stack">
              {guardians.map((guardian, index) => (
                <fieldset className="family-person-card guardian-person-card" key={guardian.id}>
                  <legend className="family-person-legend">
                    <span className="family-person-number">{String(index + 1).padStart(2, "0")}</span>
                    <span>{guardian.name || `Guardian ${index + 1}`}</span>
                    {index === 0 && <span className="family-primary-chip">Primary account</span>}
                  </legend>

                  {index > 0 && (
                    <button
                      type="button"
                      className="family-remove-button"
                      onClick={() => removeGuardian(guardian.id)}
                      aria-label={`Remove guardian ${index + 1}`}
                    >
                      Remove
                    </button>
                  )}

                  <div className="family-field-grid">
                    <label className="family-field">
                      <span>Name</span>
                      <input
                        value={guardian.name}
                        onChange={(event) => updateGuardian(guardian.id, { name: event.target.value })}
                        placeholder="Guardian or caregiver name"
                        required
                      />
                    </label>

                    <label className="family-field">
                      <span>Relationship</span>
                      <select
                        value={guardian.relationship}
                        onChange={(event) => updateGuardian(guardian.id, { relationship: event.target.value })}
                      >
                        <option>Parent</option>
                        <option>Guardian</option>
                        <option>Grandparent</option>
                        <option>Caregiver</option>
                        <option>Other family member</option>
                      </select>
                    </label>

                    <label className="family-field">
                      <span>Email</span>
                      <input
                        type="email"
                        value={guardian.email}
                        onChange={(event) => updateGuardian(guardian.id, { email: event.target.value })}
                        placeholder="name@example.com"
                        required={index === 0}
                      />
                    </label>

                    <label className="family-field">
                      <span>Phone <em>Optional</em></span>
                      <input
                        type="tel"
                        value={guardian.phone}
                        onChange={(event) => updateGuardian(guardian.id, { phone: event.target.value })}
                        placeholder="(555) 555-0123"
                      />
                    </label>
                  </div>

                  <label className="family-permission-toggle">
                    <input
                      type="checkbox"
                      checked={guardian.canManage}
                      onChange={(event) => updateGuardian(guardian.id, { canManage: event.target.checked })}
                    />
                    <span>
                      <strong>Family dashboard access</strong>
                      <small>Can view every student in this family and message the studio.</small>
                    </span>
                  </label>
                </fieldset>
              ))}
            </div>

            <button type="button" className="family-add-button" onClick={addGuardian}>
              <span>+</span> Add another guardian or caregiver
            </button>
          </section>
        </div>

        <aside className="family-roster-summary" aria-labelledby="roster-title">
          <p className="family-section-index">Family roster</p>
          <h2 id="roster-title">Ready to review</h2>
          <div className="family-roster-group">
            <h3>Students</h3>
            {students.map((student) => (
              <div className="family-roster-person" key={student.id}>
                <span className="family-roster-avatar">{student.avatar}</span>
                <span><strong>{student.preferredName || student.fullName || "New student"}</strong><small>{student.birthday ? `Age ${calculateAge(student.birthday)} · ` : ""}{student.instrument}</small></span>
              </div>
            ))}
          </div>
          <div className="family-roster-group">
            <h3>Guardians</h3>
            {guardians.map((guardian) => (
              <div className="family-roster-person guardian" key={guardian.id}>
                <span className="family-roster-initial">{guardian.name?.charAt(0) || "?"}</span>
                <span><strong>{guardian.name || "New guardian"}</strong><small>{guardian.relationship}{guardian.canManage ? " · Dashboard access" : ""}</small></span>
              </div>
            ))}
          </div>
          <p className="family-roster-note">You’ll confirm these details before anything is created.</p>
          <button type="submit" className="family-review-button">Review family setup <span>→</span></button>
          {saved && <p className="family-sandbox-success" role="status">Ready for review. Nothing was saved in this sandbox.</p>}
        </aside>
      </form>
    </main>
  );
}
