import {
  getLocalReviewEnvironment,
  shouldShowScaffoldSandboxBanner,
} from "./ScaffoldSandboxBanner";

test("hides the sandbox warning in a normal production build", () => {
  expect(shouldShowScaffoldSandboxBanner({})).toBe(false);
});

test("shows the sandbox warning for an isolated mock review", () => {
  expect(shouldShowScaffoldSandboxBanner({
    REACT_APP_REVIEW_DATA_MODE: "mock-isolated",
  })).toBe(true);
});

test("shows the sandbox warning for an isolated sanitized staging build", () => {
  expect(shouldShowScaffoldSandboxBanner({
    REACT_APP_STAGING_DATABASE_CONFIRMATION: "isolated-sanitized",
  })).toBe(true);
});

test("names an explicitly isolated and sanitized staging connection", () => {
  expect(getLocalReviewEnvironment({
    REACT_APP_REVIEW_DATA_MODE: "",
    REACT_APP_STAGING_DATABASE_CONFIRMATION: "isolated-sanitized",
  })).toEqual({
    environmentLabel: "Local isolated staging",
    dataMode: "isolated-sanitized",
  });
});
