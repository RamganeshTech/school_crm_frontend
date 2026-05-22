// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from '../slices/authSlice';
// import activeStudentReducer from '../slices/activeStudentSlice';

// // // 🕵️‍♂️ 1. ADD THIS TEMPORARY DEBUG MIDDLEWARE
// // const debugMiddleware = (storeAPI: any) => (next: any) => (action: any) => {
// //   if (action.type === 'auth/logout') {
// //     console.warn("🚨 GHOST LOGOUT DISPATCHED! Here is the exact file that caused it:");
// //     console.trace(); // <-- This is the magic line. It prints the full call stack!
// //   }
// //   if (action.type === 'auth/setCredentials') {
// //     console.log("✅ SET CREDENTIALS REACHED THE STORE WITH:", action.payload);
// //   }
// //   return next(action);
// // };


// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     activeStudent: activeStudentReducer
//     // Future reducers like uiSlice (for sidebar/theme) will go here
//   },

//   // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(debugMiddleware),
// });

// // Types for TypeScript intellisense
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;



// SECOND VERSION WITH PERSISTENT


import { configureStore, combineReducers } from "@reduxjs/toolkit";
// import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import authReducer from '../slices/authSlice';
import activeStudentReducer from '../slices/activeStudentSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  activeStudent: activeStudentReducer,
});

const persistConfig = {
  key: "root",
  // storage,

  storage: {
    getItem: (key: any) => Promise.resolve(localStorage.getItem(key)),
    setItem: (key: any, value: any) => Promise.resolve(localStorage.setItem(key, value)),
    removeItem: (key: any) => Promise.resolve(localStorage.removeItem(key)),
  },
  whitelist: ["activeStudent"], // ONLY this slice
};

const persistedReducer = persistReducer(
  persistConfig,
  rootReducer
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 👇 This suppresses the "non-serializable value was detected" error warning caused by redux-persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
