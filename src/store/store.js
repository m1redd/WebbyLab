import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
import moviesReducer from "../features/movies/moviesSlice";
import notificationsReducer from "../features/notification/modalNotificationSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    movies: moviesReducer,
    notifications: notificationsReducer,
  },
});
