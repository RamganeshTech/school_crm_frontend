import React from 'react';

interface ClubCardProps {
    club: any;
    canModify: boolean;
    onView: (clubId: string) => void;
    onEdit: (club: any) => void;
    onDelete: (clubId: string, clubName: string) => void;
    onUpdateThumbnail: (e: React.ChangeEvent<HTMLInputElement>, clubId: string) => void;
    isDeleting: boolean;
    isUpdatingThumb: boolean;
}

export default function ClubCard({
    club,
    onView,
    canModify,
    onEdit,
    onDelete,
    onUpdateThumbnail,
    isDeleting,
    isUpdatingThumb
}: ClubCardProps) {




    return (
        <div className="flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">

            {/* Clickable Image & Content Area for Navigation */}
            <div
                className="flex-1 flex flex-col cursor-pointer"
                onClick={() => onView(club._id)}
            >
                {/* Image Section */}
                <div className="relative h-40 w-full bg-gray-50 border-b border-gray-100 overflow-hidden flex-shrink-0">
                    {club.thumbnail?.url ? (
                        <img
                            src={club.thumbnail.url}
                            alt={club.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-[#f8fafc]">
                            <i className="fas fa-image text-2xl mb-1.5 opacity-50"></i>
                            <span className="text-[9px] font-semibold tracking-widest uppercase opacity-60">No Cover</span>
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded border bg-white/95 backdrop-blur-sm shadow-sm ${club.isActive
                            ? 'text-emerald-600 border-emerald-100'
                            : 'text-rose-600 border-rose-100'
                            }`}>
                            {club.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    {/* Member Count */}
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm border border-gray-100 text-gray-700 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                        <i className="fas fa-user-friends text-primary"></i>
                        {club.studentId?.length || 0}
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex-1 flex flex-col bg-white">
                    <h3 className="text-[15px] font-bold text-gray-800 mb-1 line-clamp-1" title={club.name}>
                        {club.name}
                    </h3>
                    <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2">
                        {club.description || "No description provided."}
                    </p>
                </div>
            </div>

            {/* ADMIN ACTION BAR */}

            <div className="border-t border-gray-100 bg-white flex items-center justify-around py-3 px-2">

                {/* VIEW */}
                <button
                    onClick={() => onView(club._id)}
                    className="flex cursor-pointer flex-col items-center justify-center gap-1 text-blue-500 hover:text-blue-700 transition-colors bg-transparent"
                >
                    <i className="fas fa-external-link-alt text-[13px]"></i>
                    <span className="text-[10px] font-semibold tracking-wider text-blue-600">VIEW</span>
                </button>

                {canModify && <>
                    {/* EDIT */}
                    <button
                        onClick={() => onEdit(club)}
                        className="flex cursor-pointer flex-col items-center justify-center gap-1 text-gray-500 hover:text-gray-800 transition-colors bg-transparent border-l border-gray-100 pl-4"
                    >
                        <i className="fas fa-pen text-[13px]"></i>
                        <span className="text-[10px] font-semibold tracking-wider text-gray-600">EDIT</span>
                    </button>

                    {/* COVER */}
                    <label className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer bg-transparent border-l border-gray-100 pl-4">
                        {isUpdatingThumb ? (
                            <i className="fas fa-circle-notch fa-spin text-[13px] text-primary"></i>
                        ) : (
                            <i className="fas fa-image text-[13px]"></i>
                        )}
                        <span className="text-[10px] font-semibold tracking-wider text-gray-600">COVER</span>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => onUpdateThumbnail(e, club._id)}
                            disabled={isUpdatingThumb}
                        />
                    </label>

                    {/* DELETE */}
                    <button
                        onClick={() => onDelete(club._id, club.name)}
                        disabled={isDeleting}
                        className="flex cursor-pointer flex-col items-center justify-center gap-1 text-rose-500 hover:text-rose-700 transition-colors bg-transparent border-l border-gray-100 pl-4"
                    >
                        {isDeleting ? (
                            <i className="fas fa-circle-notch fa-spin text-[13px]"></i>
                        ) : (
                            <i className="far fa-trash-alt text-[13px]"></i>
                        )}
                        <span className="text-[10px] font-semibold tracking-wider text-rose-500">DELETE</span>
                    </button>
                </>}

            </div>

        </div>
    );
}