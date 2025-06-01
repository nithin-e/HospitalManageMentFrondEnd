import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/authSlice";
import doctorReducer from './slices/DoctorSlice';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";

// Separate persist configs for different slices if needed
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ['user', 'isUserAuthenticated'], // Only persist these fields
};

const doctorPersistConfig = {
  key: "doctor",
  storage,
};

// Create persisted reducers
const persistedUserReducer = persistReducer(authPersistConfig, userReducer);
const persistedDoctorReducer = persistReducer(doctorPersistConfig, doctorReducer);

// Configure store with persisted reducers
export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    doctor: persistedDoctorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;