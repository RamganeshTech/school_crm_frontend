import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getStudentRecordByIdV1 } from "../../api_services/student_api/studentRecordApi";
import type { UserRole } from "./authSlice";


interface CurrentContextState {
  studentId: string | null;
  classId: string | null;
  sectionId: string | null;
    studentRecordId: string | null;
  academicYear: string | null;
  unlockedModules: string[];

}

const initialState: CurrentContextState = {
  studentId: null,
  classId: null,
  sectionId: null,
   studentRecordId: null,
  academicYear: null,
  unlockedModules: [],
};

const currentContextSlice = createSlice({
  name: "activeStudent",
  initialState,
  reducers: {
    setStudentId: (state, action: PayloadAction<string | null>) => {
      state.studentId = action.payload;
    },

    setClassId: (state, action: PayloadAction<string | null>) => {
      state.classId = action.payload;
    },

    setSectionId: (state, action: PayloadAction<string | null>) => {
      state.sectionId = action.payload;
    },

     // NEW: sets record id, academic year, and unlocked modules together
    // (they always arrive together from the student-record API response)
    setModuleAccess: (
      state,
      action: PayloadAction<{
        studentRecordId: string | null;
        academicYear: string | null;
        unlockedModules: string[];
      }>
    ) => {
      state.studentRecordId = action.payload.studentRecordId;
      state.academicYear = action.payload.academicYear;
      state.unlockedModules = action.payload.unlockedModules;
    },

    clearCurrentstudent: (state) => {
      state.studentId = null;
      state.classId = null;
      state.sectionId = null;
      state.studentRecordId = null;
      state.academicYear = null;
      state.unlockedModules = [];
    },
  },
});


interface SelectStudentPayload {
  student: any;
  schoolId: string;
  currentRole: UserRole;
  academicYear?: string;
}

export const selectStudentAndSync = createAsyncThunk(
  'activeStudent/selectAndSync',
  async (
    { student, schoolId, currentRole, academicYear }: SelectStudentPayload,
    { dispatch }
  ) => {
    // 1. Immediately store the student IDs in Redux
    const studentId = student._id;
    const classId = student.currentClassId?._id || student?.currentClassId || null;
    const sectionId = student.currentSectionId?._id || student?.currentSectionId || null;

    dispatch(setStudentId(studentId));
    dispatch(setClassId(classId));
    dispatch(setSectionId(sectionId));

    // 2. Fetch the student record directly using your plain async API function
    const recordData = await getStudentRecordByIdV1({
      currentRole,
      schoolId,
      studentId,
      academicYear,
    });

    // 3. Dispatch the module permissions to Redux
    if (recordData) {
      dispatch(
        setModuleAccess({
          studentRecordId: recordData._id,
          academicYear: recordData.academicYear,
          unlockedModules: (recordData.unlockedModules || []).map((m: string) =>
            m.toLowerCase()
          ),
        })
      );
    }

    return recordData;
  }
);

export const {
  setStudentId,
  setClassId,
  setSectionId,
  setModuleAccess,
  clearCurrentstudent,
} = currentContextSlice.actions;

export default currentContextSlice.reducer;