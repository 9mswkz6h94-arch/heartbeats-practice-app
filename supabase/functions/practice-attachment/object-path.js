export function assignmentObjectPath(locator, teacherId, projectUrl) {
  if (!locator || !teacherId || !projectUrl) return null;
  const prefix = "/storage/v1/object/public/assignment-attachments/";
  let path;
  if (locator.startsWith("assignment-file:")) path = locator.slice("assignment-file:".length);
  else {
    try {
      const url = new URL(locator);
      if (url.origin !== new URL(projectUrl).origin || !url.pathname.startsWith(prefix)) return null;
      path = decodeURIComponent(url.pathname.slice(prefix.length));
    } catch { return null; }
  }
  const [folder, name, extra] = path.split("/");
  if (folder !== teacherId || extra !== undefined || !/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(name || "")) return null;
  return path;
}
