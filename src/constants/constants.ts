// export const APP_PATHS = {
//     // Public
//     LOGIN: '/login',
import noimg from '../assets/no image.jpeg'
import DLogo from '../assets/daily-grades-app-icon-generic-square.png'


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


export const DOMAIN_NAME = "Daily Grades"
export const DOMAIN_IMG = DLogo

export const NO_IMAGE = noimg


export type ValidUserRole = Exclude<UserRole, null>;

export const AUTH_CHECK_ROLES: ValidUserRole[] = [
    "correspondent",
    "teacher",
    "principal",
    "parent",
    "accountant",
    "administrator",
    "viceprincipal"
];

export const STAFF_ALL: UserRole[] = [
    "correspondent",
    "teacher",
    "principal",
    "accountant",
    "administrator",
    "viceprincipal"
]

// Only the Correspondent
export const SUPER_ADMIN_ONLY: UserRole[] = ["correspondent"];

// Top-level management (No Teachers, No Accountants)
export const MANAGEMENT_ONLY: UserRole[] = ["correspondent", "administrator", "principal", "viceprincipal"];

// Staff handling money + Management
export const FINANCE_ACCESS: UserRole[] = ["correspondent", "administrator", "principal", "viceprincipal", "accountant"];

// Staff handling classes/grading + Management
export const ACADEMIC_ACCESS: UserRole[] = ["correspondent", "administrator", "principal", "viceprincipal", "teacher"];

export const HIGHER_OFFICIALS: UserRole[] = ["correspondent", "principal",];



export interface SubMenuItem {
    icon: string
    name: string;
    path: string;
}

export interface MenuItem {
    name: string;
    path: string;
    icon: string;
    subMenu?: SubMenuItem[];
}

const baseManagementMenu: MenuItem[] = [
    { name: 'Dashboard', path: "/dashboard/dashboard-main", icon: 'fas fa-chart-pie' },
    { name: 'Profile', path: "/dashboard/profile", icon: 'fas fa-user' },
    { name: 'Staffs', path: "/dashboard/user-list", icon: 'fas fa-users-gear' },
    // { name: 'Class', path: "/dashboard/class", icon: 'fas fa-chalkboard' },
    // { name: 'Section', path: "/dashboard/section", icon: 'fas fa-box' },

    {
        name: "Academic Management",
        path: "#",
        icon: "fas fa-school",
        subMenu: [
            {
                name: "Class",
                path: "/dashboard/class",
                icon: "fas fa-chalkboard"
            },
            {
                name: "Section",
                path: "/dashboard/section",
                icon: "fas fa-box"
            },
            {
                name: "TimeTable",
                path: "/dashboard/timetable",
                icon: "fas fa-table"
            }
        ]
    },

    { name: 'School', path: "/dashboard/school", icon: 'fas fa-building' },
    { name: 'School List', path: "/dashboard/school-list", icon: 'fas fa-layer-group' },
    // { name: 'Admission', path: "/dashboard/admission-form", icon: 'fas fa-user-graduate' },
    // { name: 'Students', path: "/dashboard/student", icon: 'fas fa-user-group' },
    // { name: 'Records', path: "/dashboard/student-record", icon: 'fas fa-user-group' },

    {
        name: "Student Management",
        path: "#",
        icon: "fas fa-user-group",
        subMenu: [
            {
                name: "Admission",
                path: "/dashboard/admission-form",
                icon: "fas fa-user-graduate"
            },
            {
                name: "Students",
                path: "/dashboard/student",
                icon: "fas fa-user-group"
            },
            {
                name: "Records",
                path: "/dashboard/student-record",
                icon: "fas fa-folder-open"
            },
            { name: 'Fee Collection', path: "/dashboard/fee-collection", icon: 'fas fa-cash-register' },

        ]
    },

    // { name: 'Attendance', path: "/dashboard/attendance", icon: 'fas fa-clipboard' },
    { name: 'Teacher Assignments', path: "/dashboard/teacher-assignment", icon: 'fas fa-chalkboard-user' },
    // { name: 'TimeTable', path: "/dashboard/timetable", icon: 'fas fa-table' },
    { name: 'Expense', path: "/dashboard/expense", icon: 'fas fa-file-invoice-dollar' },
    // { name: 'Homework', path: "/dashboard/homework", icon: 'fas fa-calendar-check' },

    {
        name: "Classroom Management",
        path: "#",
        icon: "fas fa-chalkboard-user",
        subMenu: [
            {
                name: "Attendance",
                path: "/dashboard/attendance",
                icon: "fas fa-clipboard"
            },
            // {
            //     name: "TimeTable",
            //     path: "/dashboard/timetable",
            //     icon: "fas fa-table"
            // },
            {
                name: "Homework",
                path: "/dashboard/homework",
                icon: "fas fa-calendar-check"
            }
        ]
    },

    // { name: 'Finance', path: "/dashboard/finance", icon: 'fas fa-book-open' },
    // { name: 'Audit', path: "/dashboard/audit", icon: 'fas fa-shield-alt' },
    // { name: 'Archive', path: "/dashboard/delete-archive", icon: 'fas fa-trash-restore' },

    {
        name: "System Logs",
        path: "#",
        icon: "fas fa-history",
        subMenu: [
            {
                name: "Finance Logs",
                path: "/dashboard/finance",
                icon: "fas fa-book-open"
            },
            {
                name: "Audit Logs",
                path: "/dashboard/audit",
                icon: "fas fa-shield-alt"
            },
            {
                name: "Archive",
                path: "/dashboard/delete-archive",
                icon: "fas fa-trash-restore"
            }
        ]
    },

    { name: 'Announcement', path: "/dashboard/announcement", icon: 'fas fa-bullhorn' },
    { name: 'Clubs', path: "/dashboard/club", icon: 'fas fa-layer-group' },

    // { name: 'Fee Structure', path: "/dashboard/fee-structure", icon: 'fas fa-coins' },
    // { name: 'Fee Config', path: "/dashboard/fee-configuration", icon: 'fas fa-sliders' },

    {
        name: "Fee Management",
        path: "/dashboard/fee-structure",
        icon: "fas fa-coins",
        subMenu: [
            {
                name: "Fee Structure",
                path: "/dashboard/fee-structure",
                icon: "fas fa-coins"
            },
            {
                name: "Fee Config",
                path: "/dashboard/fee-configuration",
                icon: "fas fa-sliders"
            },
        ]
    },


    // { name: 'Mark report', path: "/dashboard/markreport", icon: 'fas fa-file-invoice' },
    // { name: 'Mark report Configuration', path: "/dashboard/markreport-config", icon: 'fas fa-file-invoice' },

    {
        name: "Examination",
        path: "#",
        icon: "fas fa-file-invoice",
        subMenu: [
            {
                name: "Mark Report",
                path: "/dashboard/markreport",
                icon: "fas fa-file-invoice"
            },
            {
                name: "Mark Report Configuration",
                path: "/dashboard/markreport-config",
                icon: "fas fa-file-circle-check"
            }
        ]
    },

    // { name: 'Fee Collection', path: "/dashboard/fee-collection", icon: 'fas fa-cash-register' },

];

// export const principalMenu: MenuItem[] = [
//     // { name: 'Dashboard', path: "/dashboard", icon: 'fas fa-th-large' },
//     // { name: 'Dashboard', path: "/dashboard", icon: 'fas fa-chart-pie-simple'},
//     { name: 'Dashboard', path: "/dashboard/dashboard-main", icon: 'fas fa-chart-pie' }, //or use this fas fa-chart-simple
//     { name: 'Profile', path: "/dashboard/profile", icon: 'fas fa-user' },
//     { name: 'Staffs', path: "/dashboard/user-list", icon: 'fas fa-users-gear' },
//     { name: 'Class', path: "/dashboard/class", icon: 'fas fa-chalkboard' },
//     { name: 'Section', path: "/dashboard/section", icon: 'fas fa-box' },
//     { name: 'School', path: "/dashboard/school", icon: 'fas fa-building' },
//     { name: 'School List', path: "/dashboard/school-list", icon: 'fas fa-layer-group' },
//     { name: 'Students', path: "/dashboard/student", icon: 'fas fa-user-group' },
//     { name: 'Records', path: "/dashboard/student-record", icon: 'fas fa-user-group' },
//     { name: 'Attendance', path: "/dashboard/attendance", icon: 'fas fa-clipboard' },
//     { name: 'Teacher Assignments', path: "/dashboard/teacher-assignment", icon: 'fas fa-chalkboard-user' },
//     { name: 'TimeTable', path: "/dashboard/timetable", icon: 'fas fa-table' },
//     { name: 'Expense', path: "/dashboard/expense", icon: 'fas fa-file-invoice-dollar' },
//     { name: 'Homework', path: "/dashboard/homework", icon: 'fas fa-calendar-check' },
//     // { name: 'Homework Submission', path: "/dashboard/homework-submission", icon: 'fas fa-calendar-check' },
//     { name: 'Finance', path: "/dashboard/finance", icon: 'fas fa-book-open' },
//     { name: 'Audit', path: "/dashboard/audit", icon: 'fas fa-shield-alt' },
//     { name: 'Archive', path: "/dashboard/delete-archive", icon: 'fas fa-trash-restore' },
//     { name: 'Announcement', path: "/dashboard/announcement", icon: 'fas fa-bullhorn' },
//     { name: 'Clubs', path: "/dashboard/club", icon: 'fas fa-layer-group' },
//     { name: 'Fee Structure', path: "/dashboard/fee-structure", icon: 'fas fa-coins' },
//     // { name: 'Profile Selection', path: "/dashboard/profile-selection", icon: 'fas fa-user-group' },
//     { name: 'Mark report', path: "/dashboard/markreport", icon: 'fas fa-file-invoice' },
//     { name: 'Mark report Configuration', path: "/dashboard/markreport-config", icon: 'fas fa-file-invoice' },
//     { name: 'Subscription', path: "/dashboard/subscription", icon: 'fas fa-crown' },
// ];


// 2. Compose the Principal's menu by adding subscription to the end
export const principalMenu: MenuItem[] = [
    ...baseManagementMenu,
    { name: 'Subscription', path: "/dashboard/subscription", icon: 'fas fa-crown' }
];

export const vicePrincipalMenu: MenuItem[] = [
    ...baseManagementMenu,
]

// --- NEW: ACCOUNTANT MENU ---
export const accountantMenu: MenuItem[] = [
    { name: 'Dashboard', path: "/dashboard/dashboard-main", icon: 'fas fa-chart-pie' },
    { name: 'Profile', path: "/dashboard/profile", icon: 'fas fa-user' },
    // { name: 'Class', path: "/dashboard/class", icon: 'fas fa-chalkboard' },
    // { name: 'Section', path: "/dashboard/section", icon: 'fas fa-box' },

    {
        name: "Academic Management",
        path: "#",
        icon: "fas fa-school",
        subMenu: [
            {
                name: "Class",
                path: "/dashboard/class",
                icon: "fas fa-chalkboard"
            },
            {
                name: "Section",
                path: "/dashboard/section",
                icon: "fas fa-box"
            }
        ]
    },

    {
        name: "Student Management",
        path: "#",
        icon: "fas fa-user-group",
        subMenu: [
            {
                name: "Students",
                path: "/dashboard/student",
                icon: "fas fa-user-group"
            },
            {
                name: "Records",
                path: "/dashboard/student-record",
                icon: "fas fa-folder-open"
            },
            { name: 'Fee Collection', path: "/dashboard/fee-collection", icon: 'fas fa-cash-register' },
        ]
    },

    // { name: 'Students', path: "/dashboard/student", icon: 'fas fa-user-group' },
    // { name: 'Records', path: "/dashboard/student-record", icon: 'fas fa-user-group' },
    // { name: 'Expense', path: "/dashboard/expense", icon: 'fas fa-file-invoice-dollar' },
    // { name: 'Finance', path: "/dashboard/finance", icon: 'fas fa-book-open' },

    {
        name: "Finance Management",
        path: "#",
        icon: "fas fa-wallet",
        subMenu: [
            {
                name: "Expense",
                path: "/dashboard/expense",
                icon: "fas fa-file-invoice-dollar"
            },
            {
                name: "Finance",
                path: "/dashboard/finance",
                icon: "fas fa-book-open"
            }
        ]
    },

    // { name: 'Fee Structure', path: "/dashboard/fee-structure", icon: 'fas fa-coins' },
    // { name: 'Fee Config', path: "/dashboard/fee-configuration", icon: 'fas fa-sliders' },

    {
        name: "Fee Management",
        path: "#",
        icon: "fas fa-coins",
        subMenu: [
            {
                name: "Fee Structure",
                path: "/dashboard/fee-structure",
                icon: "fas fa-coins"
            },
            {
                name: "Fee Config",
                path: "/dashboard/fee-configuration",
                icon: "fas fa-sliders"
            },
            {
                name: "Fee Collection Module",
                path: "/dashboard/fee-collection",
                icon: "fas fa-cash-register"
            }
        ]
    }

    // { name: 'Fee Config', path: "/dashboard/fee-configuration", icon: 'fas fa-coins-settings' },

    // { name: 'Subscription', path: "/dashboard/subscription", icon: 'fas fa-crown' },
];

// --- NEW: TEACHER MENU ---
export const teacherMenu: MenuItem[] = [
    { name: 'Dashboard', path: "/dashboard/attendance-report", icon: 'fas fa-chart-pie' }, // Usually needed for home route
    { name: 'Profile', path: "/dashboard/profile", icon: 'fas fa-user' },
    { name: 'Records', path: "/dashboard/student-record", icon: 'fas fa-user-group' },
    // { name: 'Attendance', path: "/dashboard/attendance", icon: 'fas fa-clipboard' },
    // { name: 'Teacher Assignments', path: "/dashboard/teacher-assignment", icon: 'fas fa-chalkboard-user' },
    // { name: 'Homework', path: "/dashboard/homework", icon: 'fas fa-calendar-check' },

    {
        name: "Classroom Management",
        path: "#",
        icon: "fas fa-chalkboard-user",
        subMenu: [
            {
                name: "Attendance",
                path: "/dashboard/attendance",
                icon: "fas fa-clipboard"
            },
            {
                name: "Homework",
                path: "/dashboard/homework",
                icon: "fas fa-calendar-check"
            },
            {
                name: "Teacher Assignments",
                path: "/dashboard/teacher-assignment",
                icon: "fas fa-chalkboard-user"
            }
        ]
    },
    // { name: 'Mark report', path: "/dashboard/markreport", icon: 'fas fa-file-invoice' },
    // { name: 'Mark report Configuration', path: "/dashboard/markreport-config", icon: 'fas fa-file-invoice' },

    {
        name: "Examination",
        path: "#",
        icon: "fas fa-file-invoice",
        subMenu: [
            {
                name: "Mark Report",
                path: "/dashboard/markreport",
                icon: "fas fa-file-invoice"
            },
            {
                name: "Mark Report Configuration",
                path: "/dashboard/markreport-config",
                icon: "fas fa-file-circle-check"
            }
        ]
    }
];

export const cashierMenu: MenuItem[] = [
    { name: 'Fee Collection Module', path: "/dashboard/fee-collection", icon: 'fa-cash-register' },
]

export const getParentInitialMenu = (): MenuItem[] => [
    {
        name: "Parent Profile",
        path: "/dashboard/parent/profile",
        icon: "fas fa-user",
    },
    {
        name: "Profile Selection",
        path: "/dashboard/profile-selection",
        icon: "fas fa-user-group",
    },
];

// export const getParentMenu = (studentId: string | null): MenuItem[] => {
//     // Base path. If studentId exists, append it as a query parameter.
//     const queryStr = studentId ? `?studentId=${studentId}` : '';

//     return [
//         { name: 'Profile', path: `/dashboard/profile-selection/parent/profile`, icon: 'fas fa-user' },
//         { name: 'My Homework Submissions', path: `/dashboard/profile-selection/student/homework-submission${queryStr}`, icon: 'fas fa-check-circle' },
//         { name: 'Profile Selection', path: "/dashboard/profile-selection", icon: 'fas fa-user-group' },
//         { name: 'Student Profile', path: `/dashboard/profile-selection/student/record-profile/${studentId}`, icon: 'fas fa-user-group' },
//         { name: 'Student Main', path: `/dashboard/profile-selection/student/main-profile/${studentId}`, icon: 'fas fa-user-group' },
//         { name: 'Attedance', path: `/dashboard/profile-selection/student/attendace/${studentId}`, icon: 'fas fa-clipboard' },
//         { name: 'Mark report', path: `/dashboard/profile-selection/student/markreport/${studentId}`, icon: 'fas fa-file-invoice' },
//         { name: 'Annoucement', path: "/dashboard/profile-selection/student/announcement", icon: 'fas fa-bullhorn' },
//         { name: 'Clubs', path: "/dashboard/profile-selection/student/club", icon: 'fas fa-layer-group' },
//     ];
// };


interface ParentMenuParams {
    studentId: string | null;
    classId?: string | null;
    sectionId?: string | null;
    academicYear?: string | null;
}

export const getParentMenu = ({ studentId, classId, sectionId, academicYear }: ParentMenuParams): MenuItem[] => {
    // Base path. If studentId exists, append it as a query parameter.
    const queryStr = studentId ? `?studentId=${studentId}` : '';

    // 🌟 Specific query string just for the Mark Report route
    const markReportQuery = studentId
        ? `?classId=${classId || ''}&sectionId=${sectionId || ''}&academicYear=${academicYear || ''}`
        : '';

    return [
        { name: 'Profile Selection', path: "/dashboard/profile-selection", icon: 'fas fa-user-group' },
        { name: 'Parent Profile', path: `/dashboard/parent/profile`, icon: 'fas fa-user' },
        { name: 'Clubs', path: "/dashboard/student/club", icon: 'fas fa-layer-group' },
        {
            name: 'Academics',
            path: '#', // Acts as a toggle/wrapper, not a direct link
            icon: 'fas fa-book-open',
            subMenu: [
                { name: 'Announcements', path: "/dashboard/student/announcement", icon: 'fas fa-bullhorn' },
                { name: 'Homework Submissions', path: `/dashboard/student/homework-submission${queryStr}`, icon: 'fas fa-check-circle' },
                { name: 'Attendance', path: `/dashboard/student/attendace/${studentId}`, icon: 'fas fa-clipboard' },
                { name: 'Mark Report', path: `/dashboard/student/markreport/${studentId}${markReportQuery}`, icon: 'fas fa-file-invoice' },
            ]
        },

        // { name: 'Student Profile', path: `/dashboard/student/record-profile/${studentId}`, icon: 'fas fa-user-group' },
        { name: 'Student Profile', path: `/dashboard/student/main-profile/${studentId}`, icon: 'fas fa-user-group' },
        // --- Grouped Academics Menu ---
        // { name: 'Annoucement', path: "/dashboard/student/announcement", icon: 'fas fa-bullhorn' },
        // { name: 'My Homework Submissions', path: `/dashboard/student/homework-submission${queryStr}`, icon: 'fas fa-check-circle' },
        // { name: 'Attedance', path: `/dashboard/student/attendace/${studentId}`, icon: 'fas fa-clipboard' },
        // { name: 'Mark report', path: `/dashboard/student/markreport/${studentId}${markReportQuery}`, icon: 'fas fa-file-invoice' },
    ];
};