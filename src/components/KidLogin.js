import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { makeKidEmail, makeKidPassword, normalizeFamilyCode } from "../lib/familyAuth";
import "./AuthForms.css";
import "./KidLogin.css";

const CODE_STORAGE_KEY = "hb_family_code";

// Three friendly steps: family code (remembered per device) → tap your
// name/avatar → 4-digit PIN. Under the hood it's a normal Supabase password
// sign-in with the kid's synthetic email; App.js routes from there.
export default function KidLogin({ onUseEmailInstead }) {
  const [step, setStep] = useState("code"); // code | pick | pin
  const [code, setCode] = useState(() => localStorage.getItem(CODE_STORAGE_KEY) || "");
  const [kids, setKids] = useState([]);
  const [selectedKid, setSelectedKid] = useState(null);
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // If this device already knows its family, skip straight to the kid picker.
  useEffect(() => {
    if (code) lookupFamily(code, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lookupFamily = async (rawCode, silent = false) => {
    const clean = normalizeFamilyCode(rawCode);
    if (!clean) return;
    setBusy(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc("get_family_kids", { p_code: clean });
      if (rpcError) throw rpcError;
      if (!data || data.length === 0) {
        if (!silent) setError("Hmm, we couldn't find that family code. Double-check it with your grown-up!");
        localStorage.removeItem(CODE_STORAGE_KEY);
        setStep("code");
        return;
      }
      localStorage.setItem(CODE_STORAGE_KEY, clean);
      setCode(clean);
      setKids(data);
      setStep("pick");
    } catch (err) {
      if (!silent) setError(err.message || "Something went wrong — try again!");
    } finally {
      setBusy(false);
    }
  };

  // Functional update so rapid taps never read stale state; the effect below
  // fires the sign-in exactly once when the 4th digit lands.
  const handlePinDigit = (digit) => {
    if (busy) return;
    setPin((p) => (p + digit).slice(0, 4));
  };

  useEffect(() => {
    if (step === "pin" && selectedKid && pin.length === 4 && !busy) {
      signInKid(pin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  const signInKid = async (fullPin) => {
    setBusy(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: makeKidEmail(selectedKid.student_id),
        password: makeKidPassword(code, fullPin),
      });
      if (signInError) {
        setPin("");
        throw new Error("That PIN didn't match — try again!");
      }
      // App.js's auth listener takes it from here.
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form kid-login">
        {step === "code" && (
          <>
            <h2>🎵 Hi! Let's Practice</h2>
            <p className="kid-login-sub">Type your family code — a grown-up has it!</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                lookupFamily(code);
              }}
            >
              <div className="form-group">
                <input
                  className="family-code-input"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="BLUE-TIGER-42"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                  disabled={busy}
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" className="btn-submit" disabled={busy}>
                {busy ? "Looking..." : "Let's Go →"}
              </button>
            </form>
            <div className="toggle-auth">
              <p>
                Older student with an email login?
                <button type="button" className="toggle-btn" onClick={onUseEmailInstead}>
                  Use email instead
                </button>
              </p>
            </div>
          </>
        )}

        {step === "pick" && (
          <>
            <h2>👋 Who's Practicing?</h2>
            <p className="kid-login-sub">Tap your name!</p>
            <div className="kid-picker-grid">
              {kids.map((kid) => (
                <button
                  key={kid.student_id}
                  type="button"
                  className="kid-picker-card"
                  onClick={() => {
                    setSelectedKid(kid);
                    setPin("");
                    setError(null);
                    setStep("pin");
                  }}
                >
                  <span className="kid-picker-avatar">{kid.avatar || "🎵"}</span>
                  <span className="kid-picker-name">{kid.name}</span>
                </button>
              ))}
            </div>
            <div className="toggle-auth">
              <p>
                Not your family?
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => {
                    localStorage.removeItem(CODE_STORAGE_KEY);
                    setCode("");
                    setKids([]);
                    setStep("code");
                  }}
                >
                  Change family code
                </button>
              </p>
            </div>
          </>
        )}

        {step === "pin" && selectedKid && (
          <>
            <h2>
              {selectedKid.avatar || "🎵"} Hi, {selectedKid.name}!
            </h2>
            <p className="kid-login-sub">Type your secret PIN</p>
            <div className="pin-dots">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={`pin-dot ${pin.length > i ? "filled" : ""}`} />
              ))}
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="pin-pad">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "back", "0", "who"].map((key) => {
                if (key === "back") {
                  return (
                    <button
                      key={key}
                      type="button"
                      className="pin-key pin-key-util"
                      onClick={() => setPin((p) => p.slice(0, -1))}
                      disabled={busy}
                    >
                      ⌫
                    </button>
                  );
                }
                if (key === "who") {
                  return (
                    <button
                      key={key}
                      type="button"
                      className="pin-key pin-key-util"
                      onClick={() => {
                        setSelectedKid(null);
                        setPin("");
                        setError(null);
                        setStep("pick");
                      }}
                      disabled={busy}
                    >
                      👋
                    </button>
                  );
                }
                return (
                  <button
                    key={key}
                    type="button"
                    className="pin-key"
                    onClick={() => handlePinDigit(key)}
                    disabled={busy}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
            {busy && <p className="kid-login-sub" style={{ textAlign: "center" }}>Checking...</p>}
          </>
        )}
      </div>
    </div>
  );
}
