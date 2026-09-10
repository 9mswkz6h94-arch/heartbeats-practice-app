import React from "react";
import "./ScaffoldSandboxBanner.css";

export function shouldShowScaffoldSandboxBanner(environment = process.env) {
  return environment.REACT_APP_REVIEW_DATA_MODE === "mock-isolated"
    || environment.REACT_APP_STAGING_DATABASE_CONFIRMATION === "isolated-sanitized";
}

export function getLocalReviewEnvironment(environment = process.env) {
  const stagingMode = environment.REACT_APP_STAGING_DATABASE_CONFIRMATION === "isolated-sanitized";
  return {
    environmentLabel: stagingMode ? "Local isolated staging" : "Local Scaffold Sandbox",
    dataMode: environment.REACT_APP_REVIEW_DATA_MODE
      || (stagingMode ? "isolated-sanitized" : "not-configured"),
  };
}

function ScaffoldSandboxBanner() {
  const { environmentLabel, dataMode } = getLocalReviewEnvironment();
  return (
    <aside className="scaffold-sandbox-banner" aria-label="Local review environment">
      <strong>{environmentLabel}</strong><span aria-hidden="true">/</span>
      <span>Data: {dataMode}</span><span aria-hidden="true">/</span>
      <span>Not approved for deployment</span>
    </aside>
  );
}

export default ScaffoldSandboxBanner;
