import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function TeacherAccessCode({ student }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!student.familyContact && !student.needsStudentLogin) return null;
  const parent = Boolean(student.familyContact);
  return <article>
    <h3>{parent ? "Parent setup code" : "Student setup code"}</h3>
    <p>{parent ? "Give this code privately to the guardian to set or recover their parent PIN." : "Give this code to the student to connect their first sign-in."} It expires in 24 hours.</p>
    {error && <p role="alert">{error}</p>}
    {code ? <><p role="status"><strong>{code}</strong></p><button type="button" onClick={() => setCode("")}>Hide code</button></> :
      <button type="button" disabled={busy} onClick={async () => {
        setBusy(true); setError("");
        try {
          const { data, error: issue } = await supabase.rpc(parent ? "hb_issue_parent_setup" : "hb_issue_student_setup", { p_student: student.id });
          if (issue) throw issue;
          setCode(data);
        } catch (err) { setError(err.message || "Could not create a code."); }
        finally { setBusy(false); }
      }}>{parent ? "Create parent setup code" : "Create student setup code"}</button>}
  </article>;
}
