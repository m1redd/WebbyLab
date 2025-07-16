import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { deleteMovie } from "../features/movies/moviesSlice";

const DeleteConfirmation = ({ movieId, onClose }) => {
  const dispatch = useDispatch();
  const [progress, setProgress] = useState(100);
  const timerRef = useRef();
  const isCancelledRef = useRef(false);
  const duration = 10000;

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      isCancelledRef.current = true;
    };
  }, []);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateProgress = () => {
      if (isCancelledRef.current) return;

      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const newProgress = (remaining / duration) * 100;

      setProgress(newProgress);

      if (now < endTime) {
        timerRef.current = setTimeout(updateProgress, 50);
      } else if (!isCancelledRef.current) {
        handleDelete();
      }
    };

    timerRef.current = setTimeout(updateProgress, 50);

    return () => clearTimeout(timerRef.current);
  }, []);

  const handleDelete = () => {
    if (!isCancelledRef.current) {
      dispatch(deleteMovie(movieId));
    }
    onClose();
  };

  const handleCancel = () => {
    isCancelledRef.current = true;
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: "#F44336",
        color: "white",
        padding: "15px",
        borderRadius: "5px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        zIndex: 1001,
        minWidth: "400px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "3px",
          width: `${progress}%`,
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          transition: "width 50ms linear",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <strong>Confirm Deletion</strong>
          <p style={{ margin: "5px 0 0 0", fontSize: "0.9em" }}>
            Delete this movie? ({((duration * progress) / 100000).toFixed(1)}s)
          </p>
        </div>
        <div style={{ display: "flex", gap: "5px" }}>
          <button
            onClick={handleCancel}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              border: "none",
              padding: "5px 10px",
              borderRadius: "3px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            style={{
              backgroundColor: "white",
              color: "#F44336",
              border: "none",
              padding: "5px 10px",
              borderRadius: "3px",
              cursor: "pointer",
            }}
          >
            Delete Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
