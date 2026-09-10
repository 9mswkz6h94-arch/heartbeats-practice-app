import { getLocalReviewEnvironment } from "./ScaffoldSandboxBanner";

test("names an explicitly isolated and sanitized staging connection", () => {
  expect(getLocalReviewEnvironment({
    REACT_APP_REVIEW_DATA_MODE: "",
    REACT_APP_STAGING_DATABASE_CONFIRMATION: "isolated-sanitized",
  })).toEqual({
    environmentLabel: "Local isolated staging",
    dataMode: "isolated-sanitized",
  });
});
