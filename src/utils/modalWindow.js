import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeNotification } from "../features/notification/modalNotificationSlice";

const Notification = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(
    (state) => state.notifications?.notifications || []
  );

  return (
    <div style={{
      position: "fixed",
      top: "20px",
      right: "20px",
      zIndex: 2
    }}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => dispatch(removeNotification(notification.id))}
        />
      ))}
    </div>
  );
};

const NotificationItem = ({ notification, onClose }) => {
  const [progress, setProgress] = useState(100);
  const animationRef = useRef();
  const startTimeRef = useRef(Date.now());
  const duration = notification.duration || 5000;

  const animate = () => {
    const elapsed = Date.now() - startTimeRef.current;
    const newProgress = Math.max(0, 100 - (elapsed / duration) * 100);
    
    setProgress(newProgress);

    if (newProgress > 0) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    startTimeRef.current = Date.now();
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div style={{
      ...getNotificationStyle(notification.type),
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '10px',
    }}>
      <div>{notification.message}</div>
      <button
        onClick={onClose}
        style={{
          marginLeft: "10px",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          color: "white",
          border: "none",
          padding: "5px 10px",
          borderRadius: "3px",
          cursor: "pointer",
        }}
      >
        ×
      </button>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          width: `${progress}%`,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          transition: 'none',
        }}
      />
    </div>
  );
};

const getNotificationStyle = (type) => {
  const baseStyle = {
    padding: "15px",
    borderRadius: "5px",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    minWidth: "300px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  };

  switch (type) {
    case "success": return { ...baseStyle, backgroundColor: "#4CAF50" };
    case "failed": return { ...baseStyle, backgroundColor: "#F44336" };
    case "warning": return { ...baseStyle, backgroundColor: "#FF9800" };
    // case "info": return { ...baseStyle, backgroundColor: "#2196F3" };
    default: return { ...baseStyle, backgroundColor: "#333" };
  }
};

export default Notification;