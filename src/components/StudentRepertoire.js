import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import "./StudentRepertoire.css";

export default function StudentRepertoire({ studentId }) {
  const [memorizedSongs, setMemorizedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMemorizedSongs();
  }, [studentId]);

  const fetchMemorizedSongs = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get all assignments marked as memorized for this student
      const { data, error: fetchError } = await supabase
        .from("assignments")
        .select(
          `
          id,
          title,
          instrument_type,
          category,
          created_at
        `
        )
        .eq("student_id", studentId)
        .eq("memorized", true)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setMemorizedSongs(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      warmup: "#ff6b6b",
      technique: "#ffd93d",
      theory: "#6bcf7f",
      pieces: "#4a90e2",
      performance: "#b85cff",
    };
    return colors[category] || "#667eea";
  };

  const getCategoryLabel = (category) => {
    const labels = {
      warmup: "Warmup",
      technique: "Technique",
      theory: "Theory",
      pieces: "Pieces",
      performance: "Performance",
    };
    return labels[category] || "Other";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="repertoire-container">
        <p>Loading repertoire...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="repertoire-container">
        <p className="error">Error loading repertoire: {error}</p>
      </div>
    );
  }

  if (memorizedSongs.length === 0) {
    return (
      <div className="repertoire-container">
        <div className="empty-repertoire">
          <p>No memorized songs yet.</p>
          <p className="subtitle">Keep practicing to build your repertoire! 🎵</p>
        </div>
      </div>
    );
  }

  return (
    <div className="repertoire-container">
      <h3>★ Your Memorized Repertoire</h3>
      <div className="repertoire-grid">
        {memorizedSongs.map((song) => (
          <div key={song.id} className="repertoire-card">
            <div className="song-header">
              <h4>{song.title}</h4>
              <span
                className="repertoire-category-badge"
                style={{ backgroundColor: getCategoryColor(song.category) }}
              >
                {getCategoryLabel(song.category)}
              </span>
            </div>
            <div className="song-meta">
              <span className="instrument">{song.instrument_type}</span>
              <span className="date">Added {formatDate(song.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
