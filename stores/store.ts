import { configureStore } from "@reduxjs/toolkit";
import groupsReducer from "@/slice/groups/groupsSlice";
import authReducer from "@/slice/auth/authSlice";
import tripsReducer from "@/slice/trips/tripsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    groups: groupsReducer,
    trips: tripsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;