import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [userType, setUserType] = useState(null);

  return (
    <div className="App">
      <header className="App-header">
        <h1>ðŸŽµ Heart Beats Practice App</h1>
        <p>Sprint 1: Authentication System</p>
      </header>

      <main>
        {!userType ? (
          <div className="auth-selection">
            <h2>Welcome!</h2>
            <p>Are you a teacher or student?</p>
            <button onClick={() => setUserType("teacher")} className="btn btn-teacher">
              ðŸ« Teacher
            </button>
            <button onClick={() => setUserType("student")} className="btn btn-student">
              ðŸŽ“ Student
            </button>
          </div>
        ) : (
          <div className="auth-form">
            <h2>{userType === "teacher" ? "Teacher" : "Student"} Login</h2>
            <p>Email: (coming soon)</p>
            <p>Password: (coming soon)</p>
            <button onClick={() => setUserType(null)} className="btn btn-back">
              â† Back
            </button>
          </div>
        )}
      </main>

      <footer>
        <p>Phase 1: Setting up auth and database schema</p>
      </footer>
    </div>
  );
}

export default App;
