import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./AuthForms.css";

export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  // Role/profile resolution happens centrally in App.js's onAuthStateChange
  // listener — this form only triggers the Supabase auth call.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { role: "student" } },
        });

        if (signUpError) throw signUpError;

        if (!data.session) {
          // Email confirmation is required before a session is issued
          setInfo("Account created! Check your email to confirm it, then sign in below.");
          setIsSignUp(false);
          setPassword("");
        }
        // If a session came back immediately, App.js's auth listener takes it from here.
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        // App.js's auth listener resolves the student profile and routes to the dashboard.
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <h2>🎓 {isSignUp ? "Create Student Account" : "Student Sign In"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@heartbeats.studio"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {info && <div className="success-message">{info}</div>}

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="toggle-auth">
          <p>
            {isSignUp ? "Already have an account?" : "New here?"}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setInfo(null);
              }}
              className="toggle-btn"
            >
              {isSignUp ? "Sign In" : "Create Account"}
            </button>
          </p>
        </div>

        <div className="student-note">
          {isSignUp ? (
            <>
              <p>Parents: create the account here using the email your teacher has on file.</p>
              <p>Once it's set up, hand the device to your student to start practicing!</p>
            </>
          ) : (
            <>
              <p>Your teacher creates your account and assigns practice goals.</p>
              <p>Once logged in, you'll see practice cards to work through!</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
