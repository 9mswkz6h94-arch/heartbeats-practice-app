import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  AVATARS,
  INSTRUMENTS,
  makeKidEmail,
  makeKidPassword,
  randomPin,
  getSecondaryClient,
} from "../lib/familyAuth";
import {
  GUARDIAN_RELATIONSHIPS,
  birthdayError,
  calculateAge,
  normalizeOptionalText,
} from "../lib/familyProfile";
import "./AuthForms.css";
import "./FamilySignup.css";

function blankKid() {
  return {
    localId: crypto.randomUUID(),
    name: "",
    preferredName: "",
    birthday: "",
    pronouns: "",
    schoolGrade: "",
    instrument: INSTRUMENTS[0],
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    pin: randomPin(),
    state: "waiting", // waiting | created | error
    errorMsg: null,
  };
}

function blankGuardian() {
  return {
    localId: crypto.randomUUID(),
    name: "",
    relationship: "Grandparent",
    email: "",
    phone: "",
    receivesStudioContact: false,
    state: "waiting",
    errorMsg: null,
  };
}

// Parent-driven onboarding: one wizard creates the parent account, the family
// (with its login code), and every kid. Kids are created one at a time and
// each kid's row remembers whether it succeeded, so a mid-flight failure can
// be retried without duplicating the kids that already worked.
export default function FamilySignup({ onDone, onBackToLogin }) {
  const [step, setStep] = useState(1); // 1 parent, 2 kids, 3 done
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [primaryRelationship, setPrimaryRelationship] = useState("Parent");
  const [parentPhone, setParentPhone] = useState("");
  const [kids, setKids] = useState([blankKid()]);
  const [guardians, setGuardians] = useState([]);
  const [family, setFamily] = useState(null); // { id, code }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const updateKid = (localId, patch) => {
    setKids((prev) => prev.map((k) => (k.localId === localId ? { ...k, ...patch } : k)));
  };

  const updateGuardian = (localId, patch) => {
    setGuardians((prev) => prev.map((guardian) => (
      guardian.localId === localId ? { ...guardian, ...patch } : guardian
    )));
  };

  const handleParentSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role: "parent", display_name: parentName.trim() } },
      });
      if (signUpError) {
        // Returning parent who already has an account — sign them in instead.
        if (/already registered/i.test(signUpError.message || "")) {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) throw new Error("This email already has an account, but that password didn't match. Use Sign In instead.");
        } else {
          throw signUpError;
        }
      }
      if (!data?.session) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session) {
          throw new Error(
            "Account created, but email confirmation appears to be turned on in Supabase — the family wizard needs it off. (See SQL_MIGRATIONS/002 notes.)"
          );
        }
      }
      setStep(2);
    } catch (err) {
      setError(err.message || "Could not create your account");
    } finally {
      setBusy(false);
    }
  };

  const createOneKid = async (kid, familyInfo, parentEmail) => {
    const studentId = crypto.randomUUID();
    const kidEmail = makeKidEmail(studentId);
    const kidPassword = makeKidPassword(familyInfo.code, kid.pin);

    // 1. Real auth account on the secondary client (keeps parent signed in here)
    const { data: kidAuth, error: authError } = await getSecondaryClient().auth.signUp({
      email: kidEmail,
      password: kidPassword,
      options: { data: { role: "student", display_name: kid.name.trim() } },
    });
    if (authError) throw authError;

    // 2. Student row — teacher_id is auto-filled by the DB trigger; new kids
    //    start as 'pending' until the teacher approves them in the HUD.
    const { error: insertError } = await supabase.from("students").insert([
      {
        id: studentId,
        name: kid.name.trim(),
        email: kidEmail,
        auth_user_id: kidAuth?.user?.id || null,
        family_id: familyInfo.id,
        avatar: kid.avatar,
        instrument: kid.instrument,
        preferred_name: normalizeOptionalText(kid.preferredName),
        birthday: normalizeOptionalText(kid.birthday),
        pronouns: normalizeOptionalText(kid.pronouns),
        school_grade: normalizeOptionalText(kid.schoolGrade),
        status: "pending",
      },
    ]);
    if (insertError) throw insertError;

    // 3. Parent ↔ kid link
    const { error: linkError } = await supabase.from("parent_students").insert([
      {
        student_id: studentId,
        parent_email: parentEmail,
        parent_name: parentName.trim() || null,
        parent_phone: normalizeOptionalText(parentPhone),
        relationship: primaryRelationship,
        can_manage_family: true,
        parent_auth_user_id: (await supabase.auth.getUser()).data?.user?.id || null,
      },
    ]);
    if (linkError) throw linkError;
  };

  const createAdditionalGuardian = async (guardian, familyInfo) => {
    const { error: guardianError } = await supabase.from("family_guardians").insert([{
      family_id: familyInfo.id,
      name: guardian.name.trim(),
      relationship: normalizeOptionalText(guardian.relationship),
      email: normalizeOptionalText(guardian.email)?.toLowerCase() || null,
      phone: normalizeOptionalText(guardian.phone),
      receives_studio_contact: guardian.receivesStudioContact,
    }]);
    if (guardianError) throw guardianError;
  };

  const handleKidsSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const toCreate = kids.filter((k) => k.state !== "created");
    if (kids.some((k) => !k.name.trim())) {
      setError("Every kid needs a name (or remove the empty row).");
      return;
    }
    if (kids.some((k) => !/^\d{4}$/.test(k.pin))) {
      setError("Every PIN must be exactly 4 digits.");
      return;
    }
    const invalidBirthday = kids.find((kid) => birthdayError(kid.birthday));
    if (invalidBirthday) {
      setError(`${invalidBirthday.name || "A student"}: ${birthdayError(invalidBirthday.birthday)}`);
      return;
    }
    const invalidGuardian = guardians.find((guardian) => (
      !guardian.name.trim() || (!guardian.email.trim() && !guardian.phone.trim())
    ));
    if (invalidGuardian) {
      setError("Each additional guardian needs a name and either an email or phone number.");
      return;
    }

    setBusy(true);
    try {
      // Family is created once; retries reuse it.
      let fam = family;
      if (!fam) {
        const { data, error: famError } = await supabase.rpc("create_family", {
          p_display_name: parentName.trim() ? `${parentName.trim()}'s family` : null,
        });
        if (famError) throw famError;
        const row = Array.isArray(data) ? data[0] : data;
        fam = { id: row.family_id, code: row.family_code };
        setFamily(fam);
      }

      const parentEmail = email.trim().toLowerCase();
      let anyFailed = false;
      for (const guardian of guardians.filter((item) => item.state !== "created")) {
        try {
          await createAdditionalGuardian(guardian, fam);
          updateGuardian(guardian.localId, { state: "created", errorMsg: null });
        } catch (err) {
          anyFailed = true;
          updateGuardian(guardian.localId, {
            state: "error",
            errorMsg: err.message || "Failed",
          });
        }
      }

      for (const kid of toCreate) {
        try {
          await createOneKid(kid, fam, parentEmail);
          updateKid(kid.localId, { state: "created", errorMsg: null });
        } catch (err) {
          anyFailed = true;
          updateKid(kid.localId, { state: "error", errorMsg: err.message || "Failed" });
        }
      }

      if (anyFailed) {
        setError("Some family details couldn't be saved — see below. Fix them and try again; completed records won't be duplicated.");
      } else {
        setStep(3);
      }
    } catch (err) {
      setError(err.message || "Something went wrong setting up the family");
    } finally {
      setBusy(false);
    }
  };

  const copySummary = () => {
    const lines = [
      `Heart Beats family code: ${family.code}`,
      ...kids.filter((k) => k.state === "created").map((k) => `${k.avatar} ${k.name} — PIN ${k.pin}`),
    ];
    navigator.clipboard?.writeText(lines.join("\n"));
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form family-signup">
        {step === 1 && (
          <>
            <h2>Create your family account</h2>
            <p className="wizard-sub">Step 1 of 2 — your parent account. You'll add your kids next.</p>
            <form onSubmit={handleParentSubmit}>
              <div className="form-group">
                <label htmlFor="parent-name">Your name</label>
                <input
                  id="parent-name"
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="e.g., Sam Rodriguez"
                  required
                  disabled={busy}
                />
              </div>
              <div className="kid-row-split">
                <div className="form-group">
                  <label htmlFor="parent-relationship">Relationship to student</label>
                  <select
                    id="parent-relationship"
                    value={primaryRelationship}
                    onChange={(e) => setPrimaryRelationship(e.target.value)}
                    disabled={busy}
                  >
                    {GUARDIAN_RELATIONSHIPS.map((relationship) => (
                      <option key={relationship} value={relationship}>{relationship}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="parent-phone">Phone <span className="optional-label">optional</span></label>
                  <input
                    id="parent-phone"
                    type="tel"
                    autoComplete="tel"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="(555) 555-0147"
                    disabled={busy}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="parent-email">Email</label>
                <input
                  id="parent-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={busy}
                />
              </div>
              <div className="form-group">
                <label htmlFor="parent-password">Password</label>
                <input
                  id="parent-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={busy}
                />
              </div>
              {error && <div className="error-message" role="alert">{error}</div>}
              <button type="submit" className="btn-submit" disabled={busy}>
                {busy ? "Creating…" : "Next: add your kids"}
              </button>
            </form>
            <div className="toggle-auth">
              <p>
                Already have a family account?
                <button type="button" className="toggle-btn" onClick={onBackToLogin}>
                  Sign in
                </button>
              </p>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Add your kids</h2>
            <p className="wizard-sub">
              Step 2 of 2 — each kid gets an avatar and a 4-digit PIN they'll use to log in. No email needed for them.
            </p>
            <form onSubmit={handleKidsSubmit}>
              {kids.map((kid, idx) => (
                <div key={kid.localId} className={`kid-card kid-${kid.state}`}>
                  <div className="kid-card-header">
                    <span className="kid-card-title">Kid {idx + 1}</span>
                    {kid.state === "created" && <span className="kid-badge-created">✓ Added</span>}
                    {kid.state === "error" && <span className="kid-badge-error">Failed — will retry</span>}
                    {kids.length > 1 && kid.state !== "created" && (
                      <button
                        type="button"
                        className="btn-remove-kid"
                        onClick={() => setKids((prev) => prev.filter((k) => k.localId !== kid.localId))}
                        disabled={busy}
                        aria-label={`Remove kid ${idx + 1}`}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Name</label>
                    <input
                      aria-label={`Kid ${idx + 1} name`}
                      type="text"
                      value={kid.name}
                      onChange={(e) => updateKid(kid.localId, { name: e.target.value })}
                      placeholder="e.g., Maya"
                      disabled={busy || kid.state === "created"}
                    />
                  </div>

                  <div className="kid-row-split">
                    <div className="form-group">
                      <label>Preferred name <span className="optional-label">optional</span></label>
                      <input
                        aria-label={`Kid ${idx + 1} preferred name`}
                        type="text"
                        value={kid.preferredName}
                        onChange={(e) => updateKid(kid.localId, { preferredName: e.target.value })}
                        placeholder="What should we call them?"
                        disabled={busy || kid.state === "created"}
                      />
                    </div>
                    <div className="form-group">
                      <label>Birthday <span className="optional-label">private</span></label>
                      <input
                        aria-label={`Kid ${idx + 1} birthday`}
                        type="date"
                        value={kid.birthday}
                        max={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => updateKid(kid.localId, { birthday: e.target.value })}
                        disabled={busy || kid.state === "created"}
                      />
                      <span className="field-note">
                        {kid.birthday ? `Age ${calculateAge(kid.birthday)} · ` : ""}Used for age-appropriate teaching, never shown to other families.
                      </span>
                    </div>
                  </div>

                  <div className="kid-row-split">
                    <div className="form-group">
                      <label>Pronouns <span className="optional-label">optional</span></label>
                      <input
                        aria-label={`Kid ${idx + 1} pronouns`}
                        type="text"
                        value={kid.pronouns}
                        onChange={(e) => updateKid(kid.localId, { pronouns: e.target.value })}
                        placeholder="e.g., they / them"
                        disabled={busy || kid.state === "created"}
                      />
                    </div>
                    <div className="form-group">
                      <label>Grade <span className="optional-label">optional</span></label>
                      <input
                        aria-label={`Kid ${idx + 1} grade`}
                        type="text"
                        value={kid.schoolGrade}
                        onChange={(e) => updateKid(kid.localId, { schoolGrade: e.target.value })}
                        placeholder="e.g., 4th"
                        disabled={busy || kid.state === "created"}
                      />
                    </div>
                  </div>

                  <div className="kid-row-split">
                    <div className="form-group">
                      <label>Instrument</label>
                      <select
                        aria-label={`Kid ${idx + 1} instrument`}
                        value={kid.instrument}
                        onChange={(e) => updateKid(kid.localId, { instrument: e.target.value })}
                        disabled={busy || kid.state === "created"}
                      >
                        {INSTRUMENTS.map((inst) => (
                          <option key={inst} value={inst}>{inst}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Their PIN (4 digits)</label>
                      <input
                        aria-label={`Kid ${idx + 1} PIN`}
                        type="text"
                        inputMode="numeric"
                        pattern="\d{4}"
                        maxLength={4}
                        value={kid.pin}
                        onChange={(e) => updateKid(kid.localId, { pin: e.target.value.replace(/\D/g, "") })}
                        disabled={busy || kid.state === "created"}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Avatar</label>
                    <div className="avatar-picker">
                      {AVATARS.map((a) => (
                        <button
                          key={a}
                          type="button"
                          className={`avatar-option ${kid.avatar === a ? "selected" : ""}`}
                          aria-label={`Use ${a} as kid ${idx + 1} avatar`}
                          aria-pressed={kid.avatar === a}
                          onClick={() => updateKid(kid.localId, { avatar: a })}
                          disabled={busy || kid.state === "created"}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  {kid.errorMsg && <div className="error-message" role="alert">{kid.errorMsg}</div>}
                </div>
              ))}

              <button
                type="button"
                className="btn-add-kid"
                onClick={() => setKids((prev) => [...prev, blankKid()])}
                disabled={busy}
              >
                + Add another kid
              </button>

              <section className="guardian-section" aria-labelledby="additional-guardians-title">
                <div className="guardian-section-heading">
                  <div>
                    <p className="section-eyebrow">Optional</p>
                    <h3 id="additional-guardians-title">Other guardians & caregivers</h3>
                    <p>
                      Add trusted adults the studio may contact. This does not create a login or share student access.
                    </p>
                  </div>
                </div>

                {guardians.map((guardian, idx) => (
                  <div key={guardian.localId} className={`guardian-card guardian-${guardian.state}`}>
                    <div className="kid-card-header">
                      <span className="kid-card-title">Contact {idx + 1}</span>
                      {guardian.state === "created" && <span className="kid-badge-created">✓ Saved</span>}
                      {guardian.state === "error" && <span className="kid-badge-error">Failed — will retry</span>}
                      {guardian.state !== "created" && (
                        <button
                          type="button"
                          className="btn-remove-kid"
                          onClick={() => setGuardians((prev) => prev.filter((item) => item.localId !== guardian.localId))}
                          disabled={busy}
                          aria-label={`Remove additional guardian ${idx + 1}`}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Name</label>
                      <input
                        aria-label={`Additional guardian ${idx + 1} name`}
                        type="text"
                        value={guardian.name}
                        onChange={(e) => updateGuardian(guardian.localId, { name: e.target.value })}
                        disabled={busy || guardian.state === "created"}
                      />
                    </div>
                    <div className="kid-row-split">
                      <div className="form-group">
                        <label>Relationship</label>
                        <select
                          aria-label={`Additional guardian ${idx + 1} relationship`}
                          value={guardian.relationship}
                          onChange={(e) => updateGuardian(guardian.localId, { relationship: e.target.value })}
                          disabled={busy || guardian.state === "created"}
                        >
                          {GUARDIAN_RELATIONSHIPS.map((relationship) => (
                            <option key={relationship} value={relationship}>{relationship}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input
                          aria-label={`Additional guardian ${idx + 1} phone`}
                          type="tel"
                          value={guardian.phone}
                          onChange={(e) => updateGuardian(guardian.localId, { phone: e.target.value })}
                          disabled={busy || guardian.state === "created"}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        aria-label={`Additional guardian ${idx + 1} email`}
                        type="email"
                        value={guardian.email}
                        onChange={(e) => updateGuardian(guardian.localId, { email: e.target.value })}
                        disabled={busy || guardian.state === "created"}
                      />
                      <span className="field-note">At least one email or phone number is required.</span>
                    </div>
                    <label className="guardian-consent">
                      <input
                        type="checkbox"
                        checked={guardian.receivesStudioContact}
                        onChange={(e) => updateGuardian(guardian.localId, { receivesStudioContact: e.target.checked })}
                        disabled={busy || guardian.state === "created"}
                      />
                      This person may receive studio reminders and schedule messages.
                    </label>
                    {guardian.errorMsg && <div className="error-message" role="alert">{guardian.errorMsg}</div>}
                  </div>
                ))}

                <button
                  type="button"
                  className="btn-add-guardian"
                  onClick={() => setGuardians((prev) => [...prev, blankGuardian()])}
                  disabled={busy}
                >
                  + Add a guardian or caregiver
                </button>
              </section>

              {error && <div className="error-message" role="alert">{error}</div>}
              <button type="submit" className="btn-submit" disabled={busy}>
                {busy ? "Setting up your family…" : "Finish setup"}
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Your family is ready</h2>
            <div className="family-code-card">
              <p className="family-code-label">Your family code</p>
              <p className="family-code-value">{family?.code}</p>
              <p className="family-code-hint">
                Kids use this once on their device, then tap their name and enter their PIN.
              </p>
            </div>
            <div className="pin-recap">
              {kids.filter((k) => k.state === "created").map((k) => (
                <div key={k.localId} className="pin-recap-row">
                  <span className="pin-recap-kid">{k.avatar} {k.name}</span>
                  <span className="pin-recap-pin">PIN {k.pin}</span>
                </div>
              ))}
            </div>
            <button type="button" className="btn-copy-codes" onClick={copySummary}>
              Copy code and PINs
            </button>
            <p className="wizard-sub" style={{ textAlign: "center" }}>
              Your teacher will see your kids and approve them — assignments show up after that.
            </p>
            <button type="button" className="btn-submit" onClick={onDone}>
              Go to my family dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
