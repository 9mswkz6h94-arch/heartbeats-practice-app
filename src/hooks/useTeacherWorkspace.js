import { useCallback, useEffect, useState } from "react";
import { teacherWorkspaceApi } from "../lib/teacherWorkspace";

export default function useTeacherWorkspace(teacherId) {
  const [data, setData] = useState({ students: [], todaySchedule: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);
    setError(null);
    try {
      setData(await teacherWorkspaceApi.load(teacherId));
    } catch (loadError) {
      console.error("Teacher workspace could not load:", loadError);
      setError(loadError.message || "The teacher workspace could not load.");
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...data, loading, error, refresh };
}
