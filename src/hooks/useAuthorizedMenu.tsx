import { useMemo } from 'react';
import { useAuthData } from './useAuthData'; // Adjust path
import { principalMenu, accountantMenu, teacherMenu, getParentMenu, getParentInitialMenu, vicePrincipalMenu } from '../constants/constants';
import { useCurrentStudent } from './useCurrentStudent';
import { useGetSchoolById } from '../api_services/schoolConfig_api/schoolapi';
// Import your menus (Adjust paths as needed)
// import {  } from '../constants/menus'; 

// export const useAuthorizedMenu = () => {
//     // 1. Pull the necessary context automatically
//     const { currentRole, schoolId, } = useAuthData();

//     const { studentId: activeStudentId } = useCurrentStudent();


//     // 2. Wrap the logic in useMemo so it only recalculates when role/id changes
//     const authorizedMenu = useMemo(() => {
//         // Explicit Arrays for highly restricted roles
//         if (currentRole === 'parent') return getParentMenu(activeStudentId);
//         if (currentRole === 'teacher') return teacherMenu;
//         if (currentRole === 'accountant') return accountantMenu;

//         // Base list for powerful roles
//         let menu = [...principalMenu];

//         // Neglect (Filter out) specific items based on role

//         // Only correspondent gets to see 'Staffs'
//         if (currentRole !== 'correspondent') {
//             menu = menu.filter(item => item.name !== 'Staffs');
//         }

//         // ONLY show 'School List' if BOTH conditions are met:
//         // 1. User is a correspondent
//         // 2. They belong to the master platform school ID
//         if (currentRole !== 'correspondent' || schoolId !== '6942923ab194c60dc810cc6b') {
//             menu = menu.filter(item => item.name !== 'School List');
//         }

//         return menu;
//     }, [currentRole, schoolId, activeStudentId]); // Dependencies

//     return authorizedMenu;
// };


export const useAuthorizedMenu = () => {
    // 1. Pull the necessary context automatically
    const { currentRole, schoolId } = useAuthData();

    const { data } = useGetSchoolById(schoolId!)
    const academicYear = data?.currentAcademicYear


    // console.log("academicYear in auth menu", academicYear)
    // const { studentId: activeStudentId } = useCurrentStudent();
    const {
        studentId: activeStudentId,
        classId,
        sectionId
    } = useCurrentStudent();

    


    // 2. Wrap the logic in useMemo so it only recalculates when role/id changes
    const authorizedMenu = useMemo(() => {

        // --- 1. Explicit Arrays for highly restricted roles ---

        if (currentRole === 'parent') {
            // Check if activeStudentId exists. If yes, full menu. If not, initial menu.
            return activeStudentId
                ? getParentMenu({
                    studentId: activeStudentId,
                    classId: classId,
                    sectionId: sectionId,
                    academicYear: academicYear
                })
                : getParentInitialMenu();
        }

        if (currentRole === 'teacher') return teacherMenu;
        if (currentRole === 'accountant') return accountantMenu;


        // --- 2. Base list for powerful roles ---

        let menu = [...principalMenu];

        if (currentRole === "viceprincipal") {
            let VPMenu = vicePrincipalMenu;
            menu = VPMenu
        }


        // --- 3. Neglect (Filter out) specific items based on role ---

        // Only correspondent gets to see 'Staffs'
        if (currentRole !== 'correspondent') {
            menu = menu.filter(item => item.name !== 'Staffs');
        }

        // ONLY show 'School List' if BOTH conditions are met:
        // 1. User is a correspondent
        // 2. They belong to the master platform school ID
        if (currentRole !== 'correspondent' || schoolId !== '6942923ab194c60dc810cc6b') {
            menu = menu.filter(item => item.name !== 'School List');
        }

        return menu;
    }, [currentRole, schoolId, activeStudentId]); // Recalculates if any of these 3 change

    return authorizedMenu;
};