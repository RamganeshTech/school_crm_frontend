// export const APP_PATHS = {
//     // Public
//     LOGIN: '/login',

import { type UserRole } from "../features/slices/authSlice";

//     // Base Layout
//     DASHBOARD: '/dashboard',

//     // Direct Children
//     PROFILE: '/dashboard/profile',
//     CLASS: '/dashboard/class',
//     SECTION: '/dashboard/section',
//     STAFF: '/dashboard/staff',
//     SETTINGS: '/dashboard/settings',

//     // Nested Children (Students)
//     STUDENTS_ADMISSION: '/dashboard/students/admissions',
//     STUDENTS_ATTENDANCE: '/dashboard/students/attendance',
//     STUDENTS_GRADES: '/dashboard/students/grades',

//     // Nested Children (Finance)
//     FINANCE_FEES: '/dashboard/finance/fees',
//     FINANCE_PAYROLL: '/dashboard/finance/payroll',
// };

export const AUTH_CHECK_ROLES: UserRole[] = [
    "correspondent",
    "teacher",
    "principal",
    "parent",
    "accountant",
    "administrator",
    "viceprincipal"
];

export interface SubMenuItem {
    name: string;
    path: string;
}

export interface MenuItem {
    name: string;
    path: string;
    icon: string;
    subMenu?: SubMenuItem[];
}

export const principalMenu: MenuItem[] = [
    // { name: 'Dashboard', path: "/dashboard", icon: 'fas fa-th-large' },
    { name: 'Profile', path: "/dashboard/profile", icon: 'fas fa-user' },
    { name: 'Class', path: "/dashboard/class", icon: 'fas fa-chalkboard' },
    { name: 'Section', path: "/dashboard/section", icon: 'fas fa-box' },
    { name: 'School', path: "/dashboard/school", icon: 'fas fa-building' },
    { name: 'School List', path: "/dashboard/school-list", icon: 'fas fa-layer-group' },
    { name: 'Students', path: "/dashboard/student", icon: 'fas fa-user-group' },
    { name: 'Records', path: "/dashboard/student-record", icon: 'fas fa-user-group' },
    { name: 'Attendance', path: "/dashboard/attendance", icon: 'fas fa-clipboard' },
    { name: 'Assignments', path: "/dashboard/teacher-assignment", icon: 'fas fa-user' },
    { name: 'TimeTable', path: "/dashboard/timetable", icon: 'fas fa-table' },
    { name: 'Expense', path: "/dashboard/expense", icon: 'fas fa-money' },
    { name: 'Homework', path: "/dashboard/homework", icon: 'fas fa-noteclip' },
    { name: 'Homework Submission', path: "/dashboard/homework-submission", icon: 'fas fa-noteclip' },
    { name: 'Finance', path: "/dashboard/delete-archive", icon: 'fas fa-trash' },
    { name: 'Audit', path: "/dashboard/audit", icon: 'fas fa-noteclip' },
    { name: 'Announcement', path: "/dashboard/announcement", icon: 'fas fa-bullhorn' },
    { name: 'Clubs', path: "/dashboard/club", icon: 'fas fa-layer-group' },
    { name: 'Fee Structure', path: "/dashboard/fee-structure", icon: 'fas fa-coins' },

];



export const getParentMenu = (studentId: string | null): MenuItem[] => {
    // Base path. If studentId exists, append it as a query parameter.
    const queryStr = studentId ? `?studentId=${studentId}` : '';

    return [
        { name: 'Profile', path: `/dashboard/profile`, icon: 'fas fa-user' },
        { name: 'Attendance', path: `/dashboard/attendance${queryStr}`, icon: 'fas fa-clipboard' },
        { name: 'Homework', path: `/dashboard/homework${queryStr}`, icon: 'fas fa-book' },
        { name: 'My Homework Submissions', path: `/dashboard/homework-submission${queryStr}`, icon: 'fas fa-check-circle' },
    ];
};