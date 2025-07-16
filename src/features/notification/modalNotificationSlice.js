import { createSlice } from "@reduxjs/toolkit";

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
  },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        type: action.payload.type || "info",
        message: action.payload.message,
        autoHide: action.payload.autoHide !== false,
        duration: action.payload.duration || 5000,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
  },
});

export const { addNotification, removeNotification } =
  notificationsSlice.actions;

export const showNotification = (payload) => (dispatch) => {
  const notificationId = Date.now();
  const notification = {
    id: notificationId,
    type: payload.type || "info",
    message: payload.message,
    autoHide: payload.autoHide !== false,
    duration: payload.duration || 5000,
  };

  dispatch(addNotification(notification));

  if (notification.autoHide) {
    setTimeout(() => {
      dispatch(removeNotification(notificationId));
    }, notification.duration);
  }
};

export default notificationsSlice.reducer;
