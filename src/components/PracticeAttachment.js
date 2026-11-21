import React, { useEffect, useState } from "react";
import { useWorkspaceClient } from "../lib/familySpaceClient";

const formats = { pdf: "application/pdf", png: "image/png", jpeg: "image/jpeg", jpg: "image/jpeg", gif: "image/gif", webp: "image/webp" };

export default function PracticeAttachment({ assignmentId, locator }) {
  const client = useWorkspaceClient();
  const [fileUrl, setFileUrl] = useState(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const type = formats[locator.split(".").pop().toLowerCase()] || "application/octet-stream";
  useEffect(() => {
    let active = true;
    let url;
    setFileUrl(null); setError(false);
    (async () => {
      try {
        const result = await client.functions.invoke("practice-attachment", { body: { assignment_id: assignmentId } });
        if (result.error || !(result.data instanceof Blob)) throw new Error();
        if (!active) return;
        url = URL.createObjectURL(result.data.slice(0, result.data.size, type));
        setFileUrl(url);
      } catch { if (active) setError(true); }
    })();
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [assignmentId, client, type, retry]);
  return <div className="detail-attachment">
    <div className="detail-attachment-label">Assignment sheet</div>
    {error ? <p role="alert">The sheet could not open. <button type="button" onClick={() => setRetry(n => n + 1)}>Try again</button></p> :
      !fileUrl ? <p role="status">Opening the sheet…</p> :
      type.startsWith("image/") ? <img src={fileUrl} alt="Assignment sheet" className="detail-attachment-img" /> :
      <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="detail-attachment-pdf"
        download={type === "application/octet-stream" ? "assignment" : undefined}>{type === "application/pdf" ? "Open PDF assignment sheet" : "Download assignment sheet"}</a>}
  </div>;
}
