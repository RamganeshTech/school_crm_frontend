import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Button } from '../../shared/ui/Button';
import { Input, Label } from '../../shared/ui/Input';
import { Card, CardHeader, CardContent } from '../../shared/ui/Card'; // Adjust path
import {
    useGetSchoolById,
    useUpdateSchool,
    useUpdateSchoolLogo,
    useGetSchoolSocialPlatforms,
    useUpdateSocialPlatform
} from '../../api_services/schoolConfig_api/schoolapi';
import type { RootState } from '../../features/store/store';
import { toast } from '../../shared/ui/ToastContext';
import { SearchSelect } from '../../shared/ui/SearchSelect';
import { getAcademicYears } from '../../utils/utils';
import { useRoleCheck } from '../../hooks/useRoleCheck';
import BillBookConfig from './billBook_pages/BillBookConfig';
import AdmissionBookConfig from './AdmissionBookConfig';
import SystemReadinessCard from './SystemReadinessCard';
import AcademicTimelineConfig from './AcademicTimelineConfig';

// type TabOptions = 'details' | 'socials';

type TabOptions = 'details' | 'socials' | 'billbook' | 'admissionbook' | "academicTermDate";

export default function SchoolConfiguration() {
    // --- Global State ---
    const { schoolId } = useSelector((state: RootState) => state.auth);

    const { isCorrespondent, isAdmin, isAccountant, isPrincipal, isTeacher, isVicePrincipal } = useRoleCheck()

    const canModify = isCorrespondent
    const canManageBillBook = isCorrespondent || isAdmin;
    const canShowAcademicDates = isCorrespondent || isAdmin || isAccountant || isPrincipal || isTeacher || isVicePrincipal;

    // --- API Hooks ---
    const { data: schoolData, isLoading: isSchoolLoading } = useGetSchoolById(schoolId!);
    const { data: socialData, isLoading: isSocialLoading } = useGetSchoolSocialPlatforms(schoolId!);

    const updateSchoolMutation = useUpdateSchool();
    const updateLogoMutation = useUpdateSchoolLogo();
    const updateSocialMutation = useUpdateSocialPlatform();

    // --- Local State ---
    const [activeTab, setActiveTab] = useState<TabOptions>('details');

    // Details Form State
    // const [detailsForm, setDetailsForm] = useState({
    //     name: '', email: '', phoneNo: '', address: '', currentAcademicYear: ''
    // });

    const [detailsForm, setDetailsForm] = useState({
        name: schoolData?.name || '',
        email: schoolData?.email || '',
        phoneNo: schoolData?.phoneNo || '',
        address: schoolData?.address || '',
        currentAcademicYear: schoolData?.currentAcademicYear || '',
    });

    const academicYearOptions = getAcademicYears();

    // Logo Upload State
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Socials Form State (Pre-defined common platforms for ease of use)
    const [socialsForm, setSocialsForm] = useState(socialData?.socialPlatform || {
        facebook: '', instagram: '', linkedin: '', youtube: '', twitter: ''
    });

    // --- Populate Forms on Load ---
    useEffect(() => {
        if (schoolData) {
            setDetailsForm({
                name: schoolData.name || '',
                email: schoolData.email || '',
                phoneNo: schoolData.phoneNo || '',
                address: schoolData.address || '',
                currentAcademicYear: schoolData.currentAcademicYear || '',
            });
        }
    }, [schoolData]);

    useEffect(() => {
        if (socialData) {
            // Assuming socialData returns an object mapping platforms to URLs
            setSocialsForm((prev: any) => ({ ...prev, ...socialData?.socialPlatform }));
        }
    }, [socialData]);

    // --- Handlers ---
    const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setDetailsForm(prev => ({ ...prev, [id]: value }));
    };

    const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setSocialsForm((prev: any) => ({ ...prev, [id]: value }));
    };

    const submitDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateSchoolMutation.mutateAsync({ id: schoolId!, data: detailsForm });
            // alert("School details updated successfully.");
            toast.success("Updated Successfully!");

        } catch (error: any) {
            toast.error(error.message || "Failed to Update");

        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('logo', file);

        try {
            await updateLogoMutation.mutateAsync({ id: schoolId!, formData });
            if (fileInputRef.current) fileInputRef.current.value = '';
            // alert("School logo updated successfully.");
            toast.success("Updated Successfully!");

        } catch (error: any) {
            toast.error(error.message || "Failed to Update");

        }
    };

    const submitSingleSocial = async (platform: string, link: string) => {
        try {
            await updateSocialMutation.mutateAsync({
                id: schoolId!,
                data: { socialPlatform: platform, link }
            });
            toast.success("Updated Successfully!");

        } catch (error: any) {
            toast.error(error.message || "Failed to Update");
        }
    };

    // --- Render Guards ---
    if (isSchoolLoading) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center">
                <i className="fas fa-circle-notch fa-spin text-primary text-3xl mb-4"></i>
                <p className="text-muted text-sm font-medium">Loading configuration...</p>
            </div>
        );
    }

    if (!schoolId) {
        return (
            <div className="w-full p-6 text-center bg-surface border border-divider rounded-xl mt-6">
                <p className="text-muted">No school context found. Please log in again.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full max-w-full mx-auto p-4 md:p-6 space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                    <i className="fas fa-cogs text-primary"></i>
                    School Configuration
                </h1>
                <p className="text-sm text-muted mt-1">Update your institution's core details and online presence.</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-divider">
                <button
                    onClick={() => setActiveTab('details')}
                    className={`pb-3 cursor-pointer text-sm font-medium transition-colors border-b-2 ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'}`}
                >
                    <i className="fas fa-info-circle mr-2"></i> General Details
                </button>
                <button
                    onClick={() => setActiveTab('socials')}
                    className={`pb-3 cursor-pointer text-sm font-medium transition-colors border-b-2 ${activeTab === 'socials' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'}`}
                >
                    <i className="fas fa-hashtag mr-2"></i> Social Links
                </button>

                {/* 🌟 Conditionally rendered Bill Book Tab */}
                {canManageBillBook && (
                    <button
                        onClick={() => setActiveTab('billbook')}
                        className={`pb-3 cursor-pointer text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === 'billbook' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'}`}
                    >
                        <i className="fas fa-file-invoice-dollar mr-2"></i> Bill Book
                    </button>
                )}

                {canManageBillBook && (
                    <button
                        onClick={() => setActiveTab('admissionbook')}
                        className={`pb-3 cursor-pointer text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === 'admissionbook' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'}`}
                    >
                        <i className="fas fa-address-book mr-2"></i> Admission Book
                    </button>
                )}


                {canShowAcademicDates && (
                    <button
                        onClick={() => setActiveTab('academicTermDate')}
                        className={`pb-3 cursor-pointer text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === 'academicTermDate' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'}`}
                    >
                        <i className="fas fa-calendar mr-2"></i> Academic Dates
                    </button>
                )}
            </div>

            {/* --- TAB CONTENT: DETAILS --- */}
            {/* {activeTab === 'details' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">

                    <Card className="md:col-span-1 h-fit">
                        <CardHeader title="Institution Logo" />
                        <CardContent className="flex flex-col items-center text-center space-y-4">
                            {schoolData?.logo ? (
                                <img src={(schoolData.logo as any).url || schoolData.logo} alt="Logo" className="w-32 h-32 rounded-xl object-cover border border-border shadow-sm" />
                            ) : (
                                <div className="w-32 h-32 rounded-xl bg-surface border-2 border-dashed border-border flex items-center justify-center text-muted flex-col gap-2">
                                    <i className="fas fa-image text-2xl"></i>
                                    <span className="text-xs">No Logo</span>
                                </div>
                            )}
                            <div className="w-full">
                                <Label htmlFor="logoUpload" className="sr-only">Upload Logo</Label>
                                <input
                                    type="file"
                                    id="logoUpload"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                />
                                <Button
                                    variant="outline"
                                    fullWidth
                                    leftIcon="fas fa-upload"
                                    onClick={() => fileInputRef.current?.click()}
                                    isLoading={updateLogoMutation.isPending}
                                >
                                    Change Logo
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader title="General Information" subtitle="Update the official contact and address details." />
                        <CardContent>
                            <form onSubmit={submitDetails} className="space-y-5">
                                <Input id="name" label="Institution Name" value={detailsForm.name} onChange={handleDetailsChange} disabled={updateSchoolMutation.isPending} />

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                    <Input id="email" type="email" label="Official Email" leftIcon="fas fa-envelope" value={detailsForm.email} onChange={handleDetailsChange} disabled={updateSchoolMutation.isPending} />
                                    <Input id="phoneNo" type="tel" label="Contact Number" leftIcon="fas fa-phone" value={detailsForm.phoneNo} onChange={handleDetailsChange} disabled={updateSchoolMutation.isPending} />

                                    <SearchSelect
                                        // id="currentAcademicYear"
                                        label="Academic Year"
                                        options={academicYearOptions}
                                        value={detailsForm.currentAcademicYear}
                                        // onChange={(opt) => handleFilterChange('academicYear', String(opt.value))}
                                        onChange={(opt) => setDetailsForm(prev => ({ ...prev, currentAcademicYear: String(opt.value) }))}
                                        placeholder="Select Year..."
                                    />
                                </div>

                                <Input id="address" label="Full Address" leftIcon="fas fa-map-marker-alt" value={detailsForm.address} onChange={handleDetailsChange} disabled={updateSchoolMutation.isPending} />

                                {canModify && <div className="flex justify-end pt-4">
                                    <Button type="submit" variant="primary" isLoading={updateSchoolMutation.isPending}>
                                        Save Changes
                                    </Button>
                                </div>}
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )} */}
            {/* --- TAB CONTENT: DETAILS --- */}
            {activeTab === 'details' && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-300">

                    {/* --- TOP ROW: Identity & Details --- */}
                    <div className="flex flex-col lg:flex-row gap-6 items-stretch">

                        {/* LEFT: Logo Management (Approx 35% Width) */}
                        <div className="w-full lg:w-[35%]">
                            <Card className="h-full shadow-sm border-border/60">
                                <CardHeader title="Institution Logo" />
                                <CardContent className="flex flex-col items-center text-center space-y-5">
                                    <div className="p-2 bg-surface border border-border rounded-2xl shadow-sm">
                                        {schoolData?.logo ? (
                                            <img src={(schoolData.logo as any).url || schoolData.logo} alt="Logo" className="w-32 h-32 rounded-xl object-contain bg-white" />
                                        ) : (
                                            <div className="w-32 h-32 rounded-xl bg-background flex flex-col items-center justify-center text-muted gap-2">
                                                <i className="fas fa-image text-2xl opacity-50"></i>
                                                <span className="text-xs font-medium">No Logo</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-full">
                                        <Label htmlFor="logoUpload" className="sr-only">Upload Logo</Label>
                                        <input
                                            type="file"
                                            id="logoUpload"
                                            accept="image/*"
                                            ref={fileInputRef}
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                        />
                                        <Button
                                            variant="outline"
                                            fullWidth
                                            leftIcon="fas fa-cloud-upload-alt"
                                            onClick={() => fileInputRef.current?.click()}
                                            isLoading={updateLogoMutation.isPending}
                                            disabled={!canModify}
                                            className="font-semibold"
                                        >
                                            Upload New Logo
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* RIGHT: General Information (Approx 65% Width) */}
                        <div className="w-full lg:w-[65%] flex flex-col">
                            <Card className="h-full shadow-sm border-border/60 flex flex-col">
                                <CardHeader
                                    title="General Information"
                                    subtitle="Update the official contact and address details for your institution."
                                />
                                <CardContent className="flex-1 flex flex-col">
                                    <form onSubmit={submitDetails} className="flex flex-col h-full space-y-6">
                                        <div className="space-y-6 flex-1">
                                            <Input id="name" label="Institution Name" value={detailsForm.name} onChange={handleDetailsChange} disabled={updateSchoolMutation.isPending || !canModify} />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Input id="email" type="email" label="Official Email" leftIcon="fas fa-envelope" value={detailsForm.email} onChange={handleDetailsChange} disabled={updateSchoolMutation.isPending || !canModify} />
                                                <Input id="phoneNo" type="tel" label="Contact Number" leftIcon="fas fa-phone" value={detailsForm.phoneNo} onChange={handleDetailsChange} disabled={updateSchoolMutation.isPending || !canModify} />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <SearchSelect
                                                    label="Academic Year"
                                                    options={academicYearOptions}
                                                    value={detailsForm.currentAcademicYear}
                                                    onChange={(opt: any) => setDetailsForm(prev => ({ ...prev, currentAcademicYear: String(opt.value) }))}
                                                    placeholder="Select Year..."
                                                />
                                                <Input id="address" label="Full Address" leftIcon="fas fa-map-marker-alt" value={detailsForm.address} onChange={handleDetailsChange} disabled={updateSchoolMutation.isPending || !canModify} />
                                            </div>
                                        </div>

                                        {canModify && (
                                            <div className="pt-6 border-t border-border/50 flex justify-end mt-auto">
                                                <Button type="submit" variant="primary" isLoading={updateSchoolMutation.isPending} leftIcon="fas fa-check">
                                                    Save Changes
                                                </Button>
                                            </div>
                                        )}
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* --- BOTTOM ROW: Full Width Setup Progress --- */}
                    <div className="w-full">
                        <SystemReadinessCard schoolId={schoolId!} />
                    </div>

                </div>
            )}

            {/* --- TAB CONTENT: SOCIALS --- */}
            {activeTab === 'socials' && (
                <Card className="animate-in fade-in duration-300">
                    <CardHeader title="Social Media Platforms" subtitle="Link your official accounts to display them across the platform." />
                    <CardContent>
                        {isSocialLoading ? (
                            <p className="text-sm text-muted">Loading social links...</p>
                        ) : (
                            <div className="space-y-4">
                                {/* Map through a predefined list of platforms */}
                                {[
                                    { id: 'facebook', icon: 'fab fa-facebook text-blue-600', label: 'Facebook URL' },
                                    { id: 'instagram', icon: 'fab fa-instagram text-pink-600', label: 'Instagram URL' },
                                    { id: 'linkedin', icon: 'fab fa-linkedin text-blue-700', label: 'LinkedIn URL' },
                                    { id: 'youtube', icon: 'fab fa-youtube text-red-600', label: 'YouTube Channel URL' },
                                    { id: 'twitter', icon: 'fab fa-twitter text-sky-500', label: 'X (Twitter) URL' }
                                ].map((platform) => (
                                    <div key={platform.id} className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                                        <div className="w-full">
                                            <Input
                                                id={platform.id}
                                                leftIcon={platform.icon}
                                                placeholder={platform.label}
                                                value={(socialsForm as any)[platform.id]}
                                                onChange={handleSocialChange}
                                            />
                                        </div>
                                        <Button
                                            variant="secondary"
                                            onClick={() => submitSingleSocial(platform.id, (socialsForm as any)[platform.id])}
                                            disabled={updateSocialMutation.isPending}
                                            className="shrink-0 w-full sm:w-auto"
                                        >
                                            Update
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}


            {/* --- 🌟 TAB CONTENT: BILL BOOK --- */}
            {activeTab === 'billbook' && canManageBillBook && (
                <div className="animate-in fade-in duration-300 h-full">
                    <BillBookConfig />
                </div>
            )}

            {activeTab === 'admissionbook' && canManageBillBook && (
                <div className="animate-in fade-in duration-300 h-full">
                    <AdmissionBookConfig />
                </div>
            )}

            {activeTab === 'academicTermDate' && canShowAcademicDates && (
                <div className="animate-in fade-in duration-300 h-full">
                    <AcademicTimelineConfig schoolData={schoolData} />
                </div>
            )}

        </div>
    );
}