import { useSelector } from "react-redux";
import type { RootState } from "../features/store/store";

export const useCurrentStudent = () => {
  return useSelector(
    (state: RootState) => state.activeStudent
  );
};