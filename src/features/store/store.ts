import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';


// // 🕵️‍♂️ 1. ADD THIS TEMPORARY DEBUG MIDDLEWARE
// const debugMiddleware = (storeAPI: any) => (next: any) => (action: any) => {
//   if (action.type === 'auth/logout') {
//     console.warn("🚨 GHOST LOGOUT DISPATCHED! Here is the exact file that caused it:");
//     console.trace(); // <-- This is the magic line. It prints the full call stack!
//   }
//   if (action.type === 'auth/setCredentials') {
//     console.log("✅ SET CREDENTIALS REACHED THE STORE WITH:", action.payload);
//   }
//   return next(action);
// };


export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Future reducers like uiSlice (for sidebar/theme) will go here
  },

  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(debugMiddleware),
});

// Types for TypeScript intellisense
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;