import { ProfessionalDetailsTab } from './ProfessionalDetailsTab';
import { ContactDetailsTab } from './ContactDetailsTab';
import { BankDetailsTab } from './BankDetailsTab';
import { EducationDetailsTab } from './EducationDetailsTab';
import { SalarySlipsTab } from './SalarySlipsTab';
import { DocumentsTab } from './DocumentsTab';

export type EmployeeProfileTabType = 'profile' | 'professional' | 'contact' | 'bank' | 'education' | 'salary' | 'documents';

export const EMPLOYEE_PROFILE_TABS: { key: EmployeeProfileTabType; label: string; icon: string }[] = [
    { key: 'professional', label: 'Professional Details', icon: 'fas fa-briefcase' },
    { key: 'contact', label: 'Contact Information', icon: 'fas fa-address-card' },
    { key: 'bank', label: 'Bank Details', icon: 'fas fa-building-columns' },
    { key: 'education', label: 'Education', icon: 'fas fa-graduation-cap' },
    { key: 'salary', label: 'Salary Slips', icon: 'fas fa-file-invoice-dollar' },
    { key: 'documents', label: 'Documents', icon: 'fas fa-folder-open' },
];

interface UserProfileComponentsProps {
    activeTab: EmployeeProfileTabType;
    userId: string;
    schoolId: string;
    validProfile: any;
    hasProfile: boolean;
    isLoading: boolean;
    refetch: () => void;
    canEdit?: boolean;
}

export function UserProfileComponents({
    activeTab, userId, schoolId, validProfile, hasProfile, isLoading, refetch, canEdit = true
}: UserProfileComponentsProps) {
    switch (activeTab) {
        case 'professional':
            return (
                <ProfessionalDetailsTab
                    userId={userId} schoolId={schoolId} validProfile={validProfile}
                    hasProfile={hasProfile} isLoading={isLoading} refetch={refetch} canEdit={canEdit}
                />
            );
        case 'contact':
            return <ContactDetailsTab userId={userId} validProfile={validProfile} hasProfile={hasProfile} canEdit={canEdit} refetch={refetch} />;
        case 'bank':
            return <BankDetailsTab userId={userId} validProfile={validProfile} hasProfile={hasProfile} canEdit={canEdit} refetch={refetch} />;
        case 'education':
            return <EducationDetailsTab userId={userId} validProfile={validProfile} hasProfile={hasProfile} canEdit={canEdit} refetch={refetch} />;
        case 'salary':
            return (
                <SalarySlipsTab
                    userId={userId} hasProfile={hasProfile}
                    salarySlips={validProfile?.salarySlips || []} refetch={refetch} canEdit={canEdit}
                />
            );
        case 'documents':
            return (
                <DocumentsTab
                    userId={userId} hasProfile={hasProfile}
                    documents={validProfile?.documents || []} refetch={refetch}
                />
            );
        default:
            return null;
    }
}