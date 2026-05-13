import { type UserRole } from "../features/slices/authSlice";

export const checkPermission = (
  userRole: UserRole, 
  allowedRoles: Partial<UserRole[]>
): void => {
  if (!userRole || !allowedRoles.includes(userRole)) {
    throw new Error('UNAUTHORIZED_ACTION: You do not have permission to perform this action.');
  }
};



export const getAcademicYears = (): any[] => {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 10; // Go 10 years back
  const options: any[] = [];

  // Generate 21 options to cover a 20-year span (10 past, current, 10 future)
  for (let i = 0; i <= 20; i++) {
    const year = startYear + i;
    const academicYear = `${year}-${year + 1}`;
    options.push({ label: academicYear, value: academicYear });
  }

  return options;
};