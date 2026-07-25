import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Define the roles available in your multi-tenant system
export type UserRole = "correspondent" | "principal" | "teacher" | "parent" | "administrator" | "accountant" | "viceprincipal" | null;

interface TeacherAssignment {
  classId: string | null,
  sectionId: string | null,
  _id?: string | null
}

export interface AuthState {
  _id: string | null;
  userName: string | null; // Renamed for clarity
  schoolId: string | null;
  role: UserRole;
  token: string | null;
  profileImageUrl: string | null
  isAuthenticated: boolean;
  academicYear: string | null,
  studentId: string[]
  assignments: TeacherAssignment[],
  isPlatformAdmin: boolean
  schoolName: string | null
  schoollogoUrl: string | null
}

const initialState: AuthState = {
  _id: null,
  userName: null,
  schoolId: null,
  profileImageUrl: null,
  role: null,
  token: null,
  isAuthenticated: false,
  academicYear: null,
  studentId: [],
  assignments: [],
  isPlatformAdmin: false,
  schoolName: null,
  schoollogoUrl: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        _id: string;
        userName: string;
        schoolId: string;
        role: UserRole;
        token: string,
        academicYear: string | null;
        profileImageUrl: string | null;
        studentId: string[]
        assignments: TeacherAssignment[],
        isPlatformAdmin: boolean
        schoolName: string | null
      }>
    ) => {
      state._id = action.payload._id;
      state.userName = action.payload.userName;
      state.schoolId = action.payload.schoolId;
      state.role = action.payload.role;
      state.profileImageUrl = action.payload.profileImageUrl;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.studentId = action.payload.studentId;
      state.assignments = action.payload.assignments;
      state.isPlatformAdmin = action.payload.isPlatformAdmin;
      state.schoolName = action.payload.schoolName;
    },
    setSchool: (state, action)=>{
      state.schoolId = action.payload.schoolId
      state.schoolName = action.payload.schoolName
      state.schoollogoUrl = action.payload.schoollogoUrl
    },
    updateProfileImage: (state, action: PayloadAction<string | null>) => {
            state.profileImageUrl = action.payload;
        },
    logout: (_state) => {
      // Direct reset to initial state
      return initialState;
    },
  },
});

export const { setCredentials, logout, setSchool , updateProfileImage} = authSlice.actions;
export default authSlice.reducer;