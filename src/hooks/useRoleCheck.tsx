// hooks/useRoleCheck.ts
import { useAuthData } from './useAuthData'; // Adjust this path to your original hook

export const useRoleCheck = () => {
    const { schoolId, currentRole } = useAuthData();

    return {
        schoolId,
        currentRole,
        // Rapid boolean evaluation flags
        isAdmin: currentRole === 'administrator',
        isTeacher: currentRole === 'teacher',
        isAccountant: currentRole === 'accountant',
        isCorrespondent: currentRole === 'correspondent',
        isPrincipal: currentRole === 'principal',
        isParent: currentRole === 'parent',
        isVicePrincipal: currentRole === 'viceprincipal',
        
        // Grouped helper flags
        // isManagement: ['administrator', 'principal', 'correspondent'].includes(currentRole || ''),
        // isBilling: ['administrator', 'accountant'].includes(currentRole || '')
    };
};