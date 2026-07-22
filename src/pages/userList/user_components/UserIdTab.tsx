import { useState } from 'react';
import { ImagePreviewModal } from '../../../shared/ui/ImagePreviewModal';

interface UserIdTabProps {
    userId?: string;
    schoolId?: string;
    validProfile?: {
        userId?: {
            _id?: string;
            userName?: string;
            email?: string;
            role?: string;
            phoneNo?: string;
            profileImage?: {
                type?: string;
                key?: string;
                url?: string;
            } | null;
        };
    } | null;
    hasProfile?: boolean;
    isLoading?: boolean;
    refetch?: () => void;
    canEdit?: boolean;
    // formatRole: (role: string) => string;
}

export function UserIdTab({ validProfile, isLoading }: UserIdTabProps) {
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const user = validProfile?.userId;
    const profileImgUrl = user?.profileImage?.url;

    return (
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm max-w-7xl">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-bold text-foreground">ID Card</h2>
            </div>

            {isLoading ? (
                <div className="py-12 text-center text-muted">
                    <i className="fas fa-spinner fa-spin mr-2"></i> Loading...
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 animate-fade-in">
                    {/* --- Portrait Photo / Initial Fallback --- */}
                    <div
                        onClick={() => profileImgUrl && setIsImageModalOpen(true)}
                        className={`w-32 h-44 sm:w-36 sm:h-48 md:w-40 md:h-52 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0 shadow-sm ${
                            profileImgUrl ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                        }`}
                        title={profileImgUrl ? 'Click to view image' : ''}
                    >
                        {profileImgUrl ? (
                            <img
                                src={profileImgUrl}
                                alt={user?.userName || 'Profile'}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-4xl font-bold text-primary">
                                {user?.userName?.charAt(0)?.toUpperCase() || '-'}
                            </span>
                        )}
                    </div>

                    {/* --- Details --- */}
                    <div className="flex-1 w-full min-w-0 space-y-4 text-center sm:text-left">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-foreground flex flex-col sm:flex-row flex-wrap items-center justify-center sm:justify-start gap-2">
                                {user?.userName || '-'}
                                {user?.role && (
                                    <span className="px-2 py-1 bg-primary-soft text-primary rounded-md text-[10px] font-bold uppercase tracking-wider">
                                        {/* {formatRole(user.role)} */}
                                        {user.role}
                                    </span>
                                )}
                            </h1>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                            <div>
                                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Email</p>
                                <p className="font-medium text-foreground break-all">{user?.email || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Phone Number</p>
                                <p className="font-medium text-foreground">{user?.phoneNo || '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {profileImgUrl && (
                <ImagePreviewModal
                    isOpen={isImageModalOpen}
                    onClose={() => setIsImageModalOpen(false)}
                    imageUrl={profileImgUrl}
                    alt={user?.userName || 'Profile'}
                    title={user?.userName}
                />
            )}
        </div>
    );
}