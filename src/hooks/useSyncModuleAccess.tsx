// hooks/useSyncModuleAccess.ts
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuthData } from "./useAuthData"; // adjust path
import type { RootState } from "../features/store/store";
import { useGetStudentRecordByIdV1 } from "../api_services/student_api/studentRecordApi";
import { setModuleAccess } from "../features/slices/activeStudentSlice";

export const useSyncModuleAccess = () => {
    const dispatch = useDispatch();
    const { schoolId } = useAuthData();
    const { studentId, academicYear } = useSelector(
        (state: RootState) => state.activeStudent
    );

    const { data } = useGetStudentRecordByIdV1(schoolId!, studentId!, academicYear ?? undefined);

    useEffect(() => {
        console.log("before the availble data data from the student", data)
        if (!data) return;

        console.log("after the availble data data from the student", data)
        dispatch(
            setModuleAccess({
                studentRecordId: data?._id,
                academicYear: data?.academicYear,
                // unlockedModules: data?.unlockedModules || [],
                unlockedModules: (data.unlockedModules || []).map((m: string) => m.toLowerCase()),

            })
        );
    }, [data, dispatch]);
};