import { createSlice, type PayloadAction } from "@reduxjs/toolkit";


interface CurrentContextState {
  studentId: string | null;
  classId: string | null;
  sectionId: string | null;
}

const initialState: CurrentContextState = {
  studentId: null,
  classId: null,
  sectionId: null,
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

    clearCurrentstudent: (state) => {
      state.studentId = null;
      state.classId = null;
      state.sectionId = null;
    },
  },
});

export const {
  setStudentId,
  setClassId,
  setSectionId,
  clearCurrentstudent,
} = currentContextSlice.actions;

export default currentContextSlice.reducer;