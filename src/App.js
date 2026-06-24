import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import TeacherLogin from "./components/TeacherLogin";
import StudentLogin from "./components/StudentLogin";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentDashboard from "./components/StudentDashboard";
import "./App.css";

function App() {
  const [screen, setScreen] = useState("selection");
  const [userType, setUserType] = useState(null);
  const [userId, setUserId] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session) {
          const { data: userData, error } = await supabase
            .from("users")
            .select("user_type")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.log("User not in database yet, showing login");
            setLoading(false);
            return;
          }

          if (userData) {
            setUserType(userData.user_type);
            setUserId(session.user.id);

            if (userData.user_type === "student") {
              const { data: studentData } = await supabase
                .from("students")
                .select("id")
                .eq("email", session.user.email)
                .single();

              if (studentData) {
                setStudentId(studentData.id);
                setScreen("student-dashboard");
              }
            } else {
              setScreen("teacher-dashboard");
            }
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Auth check error:", err);
        setLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === "SIGNED_IN" && session) {
        const { data: userData } = await supabase
          .from("users")
          .select("user_type")
          .eq("id", session.user.id)
          .single();

        if (userData) {
          setUserType(userData.user_type);
          setUserId(session.user.id);

          if (userData.user_type === "student") {
            const { data: studentData } = await supabase
              .from("students")
              .select("id")
              .eq("email", session.user.email)
              .single();

            if (studentData) {
              setStudentId(studentData.id);
              setScreen("student-dashboard");
            }
          } else {
            setScreen("teacher-dashboard");
          }
        }
      } else if (event === "SIGNED_OUT") {
        setUserType(null);
        setUserId(null);
        setStudentId(null);
        setScreen("selection");
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="App">
        <div className="loading">
          <h1>Heart Beats Practice App</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const handleTeacherLogin = (type, id) => {
    setUserType(type);
    setUserId(id);
    setScreen("teacher-dashboard");
  };

  const handleStudentLogin = (type, id, authId) => {
    setUserType(type);
    setStudentId(id);
    setUserId(authId);
    setScreen("student-dashboard");
  };

  const handleLogout = () => {
    setUserType(null);
    setUserId(null);
    setStudentId(null);
    setScreen("selection");
  };

  return (
    <div className="App">
      {screen === "selection" && (
        <>
          <header className="App-header">
            <h1>Heart Beats Practice App</h1>
            <p>Sprint 1: Authentication System</p>
          </header>

          <main>
            <div className="auth-selection">
              <h2>Welcome!</h2>
              <p>Are you a teacher or student?</p>
              <button
                onClick={() => setScreen("teacher-login")}
                className="btn btn-teacher"
              >
                Teacher
              </button>
              <button
                onClick={() => setScreen("student-login")}
                className="btn btn-student"
              >
                Student
              </button>
            </div>
          </main>

          <footer>
            <p>Phase 1: Authentication & Database Integration</p>
          </footer>
        </>
      )}

      {screen === "teacher-login" && (
        <>
          <header className="App-header">
            <h1>Heart Beats Practice App</h1>
            <button
              onClick={() => setScreen("selection")}
              className="btn-back-header"
            >
              Back
            </button>
          </header>

          <main>
            <TeacherLogin onLoginSuccess={handleTeacherLogin} />
          </main>
        </>
      )}

      {screen === "student-login" && (
        <>
          <header className="App-header">
            <h1>Heart Beats Practice App</h1>
            <button
              onClick={() => setScreen("selection")}
              className="btn-back-header"
            >
              Back
            </button>
          </header>

          <main>
            <StudentLogin onLoginSuccess={handleStudentLogin} />
          </main>
        </>
      )}

      {screen === "teacher-dashboard" && (
        <TeacherDashboard userId={userId} onLogout={handleLogout} />
      )}

      {screen === "student-dashboard" && (
        <StudentDashboard studentId={studentId} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
