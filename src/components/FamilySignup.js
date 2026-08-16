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
import "./AuthForms.css";
import "./FamilySignup.css";

function blankKid() {
  return {
    localId: crypto.randomUUID(),
    name: "",
    instrument: INSTRUMENTS[0],
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    pin: randomPin(),
    state: "waiting", // waiting | created | error
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
  const [kids, setKids] = useState([blankKid()]);
  const [family, setFamily] = useState(null); // { id, code }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const updateKid = (localId, patch) => {
    setKids((prev) => prev.map((k) => (k.localId === localId ? { ...k, ...patch } : k)));
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
        parent_auth_user_id: (await supabase.auth.getUser()).data?.user?.id || null,
      },
    ]);
    if (linkError) throw linkError;
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
        setError("Some kids couldn't be added — see below. Fix and press the button again; kids already added won't be duplicated.");
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
