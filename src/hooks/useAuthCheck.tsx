import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchAuthSession } from '../api_services/auth_api/authApi';
import { logout, setCredentials } from '../features/slices/authSlice';
import { useAuthData } from './useAuthData';



export const useAuthCheck = () => {
    const dispatch = useDispatch();
    const { currentRole } = useAuthData(); // Pulling role from Redux Slice
    const [isLoading, setIsLoading] = useState(true);
    const hasChecked = useRef(false);

    useEffect(() => {
        if (hasChecked.current) return;
        hasChecked.current = true;

        // const verify = async () => {
        //     try {
        //         // The currentRole is passed for the local check inside fetchAuthSession
        //         // If it's a refresh, currentRole is empty, so fetchAuthSession proceeds to API
        //         const response = await fetchAuthSession(currentRole);

        //         if (response.ok && response.data) {
        //             const userData = response.data;

        //             const schoolIdString = typeof userData.schoolId === 'object'
        //                 ? userData.schoolId?._id
        //                 : userData.schoolId;

        //             dispatch(setCredentials({
        //                 _id: userData._id,
        //                 userName: userData.userName,
        //                 schoolId: schoolIdString || '',
        //                 role: userData.role,
        //                 token: '', // Handled by HttpOnly cookies or separate logic
        //             }));
        //         }
        //     } catch (error) {
        //         console.error("Auth verification failed:", error);
        //         dispatch(logout());
        //     } finally {
        //         setIsLoading(false);
        //     }
        // };


        const verify = async () => {
            try {
                console.log("1. Starting API call...");
                const response = await fetchAuthSession(currentRole);

                console.log("2. API call successful. Response:", response);

                if (response.ok && response.data) {
                    const userData = response.data;
                    console.log("3. Extracted userData:", userData);

                    const schoolIdString = typeof userData.schoolId === 'object'
                        ? userData.schoolId?._id
                        : userData.schoolId;

                    console.log("4. Parsed schoolId:", schoolIdString);

                    // If it prints step 4 but fails here, there is a Redux slice mismatch
                    dispatch(setCredentials({
                        _id: userData._id,
                        userName: userData.userName,
                        schoolId: schoolIdString || '',
                        role: userData.role,
                        academicYear: userData?.academicYear || null,
                        token: '',
                        studentId: userData?.studentId || [],
                        assignments: userData?.assignments || [],
                        isPlatformAdmin: userData?.isPlatformAdmin || false,
                        schoolName: userData?.schoolName || null
                    }));

                    console.log("5. Redux state successfully dispatched!");
                }
            } catch (error: any) {
                // 🚩 THIS WILL TELL US EXACTLY WHAT WENT WRONG
                console.error("❌ Auth verification failed at step:", error);
                dispatch(logout());
            } finally {
                setIsLoading(false);
            }
        };

        verify();
    }, [dispatch]); // currentRole excluded from deps to prevent re-triggering loop after dispatch

    return { isLoading };
};