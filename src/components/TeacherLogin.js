import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./AuthForms.css";

export default function TeacherLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;

        const { error: insertError } = await supabase
          .from("users")
          .insert([{ id: data.user.id, email: data.user.email, type: "teacher" }]);

        if (insertError) {
          throw new Error(`Failed to create user record: ${insertError.message}`);
        }

        setError("Sign up successful! You can now sign in with your credentials.");
        setIsSignUp(false);
        setEmail("");
        setPassword("");
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

        // Ensure user record exists in users table
        const { data: userData, error: fetchError } = await supabase
          .from("users")
          .select("type")
          .eq("id", data.user.id)
          .single();

        if (fetchError) {
          // No record yet — create one (first-time login for this account)
          await supabase.from("users").upsert([
            { id: data.user.id, email: data.user.email, type: "teacher" },
          ]);
        } else if (userData?.type !== "teacher") {
          await supabase.auth.signOut();
          throw new Error("This account is not authorized as a teacher.");
        }

        onLoginSuccess("teacher", data.user.id, data.user.email);
      }
    } catch (err) {
      console.error("Full error:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <h2>Teacher {isSignUp ? "Sign Up" : "Login"}</h2>

        <form onSubmit={handleAuth}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher@heartbeats.studio"
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
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="btn-submit"
          >
            {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="toggle-auth">
          <p>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="toggle-btn"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
