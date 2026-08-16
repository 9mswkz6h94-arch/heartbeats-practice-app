import React from "react";
import "./ScaffoldSandboxBanner.css";

function ScaffoldSandboxBanner() {
  const dataMode = process.env.REACT_APP_REVIEW_DATA_MODE || "not-configured";
  return (
    <aside className="scaffold-sandbox-banner" aria-label="Local review environment">
      <strong>Local Scaffold Sandbox</strong><span aria-hidden="true">/</span>
      <span>Data: {dataMode}</span><span aria-hidden="true">/</span>
      <span>Not approved for deployment</span>
    </aside>
  );
}

export default ScaffoldSandboxBanner;
