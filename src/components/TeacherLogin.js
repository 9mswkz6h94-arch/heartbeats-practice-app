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
        // Sign up
        console.log("Starting signup...");
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          console.error("SignUp error:", signUpError);
          throw signUpError;
        }

        console.log("SignUp successful, user ID:", data.user.id);

        // Create user record in users table
        console.log("Inserting user record...");
        const { data: insertData, error: insertError } = await supabase
          .from("users")
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              user_type: "teacher",
            },
          ])
          .select();

        console.log("Insert response:", { insertData, insertError });

        if (insertError) {
          console.error("Insert error:", insertError);
          throw new Error(`Failed to create user record: ${insertError.message}`);
        }

        setError("Sign up successful! You can now sign in with your credentials.");
        setIsSignUp(false);
        setEmail("");
        setPassword("");
      } else {
        // Sign in
        console.log("Starting signin...");
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) {
          console.error("SignIn error:", signInError);
          throw signInError;
        }

        console.log("SignIn successful, user ID:", data.user.id);

        // Verify user is a teacher
        console.log("Fetching user type...");
        const { data: userData, error: fetchError } = await supabase
          .from("users")
          .select("user_type")
          .eq("id", data.user.id)
          .single();

        console.log("Fetch response:", { userData, fetchError });

        if (fetchError) {
          console.error("Fetch error:", fetchError);
          await supabase.auth.signOut();
          throw new Error(`User record not found: ${fetchError.message}`);
        }

        if (userData?.user_type !== "teacher") {
          await supabase.auth.signOut();
          throw new Error("Not authorized as a teacher");
        }

        console.log("Auth successful!");
        onLoginSuccess("teacher", data.user.id);
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
