// import { useState } from 'react';
// import { Outlet, useNavigate } from 'react-router-dom';
// import { useAuthData } from '../../hooks/useAuthData';
// import { useGetAllUsers } from '../../api_services/auth_api/authApi';
// import { Input } from '../../shared/ui/Input';
// import { Button } from '../../shared/ui/Button';

// export default function TeacherAssignmentMain() {
//     const navigate = useNavigate();
//     const { schoolId } = useAuthData();
//     const [searchQuery, setSearchQuery] = useState('');

//     // Fetch Teachers
//     const { data: teachersData, isLoading, isError } = useGetAllUsers({ role: 'teacher', schoolId: schoolId! });
//     const teachers: any[] = teachersData || [];

//     // Filter by search
//     const filteredTeachers = teachers.filter((t: any) =>
//         t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         t.email?.toLowerCase().includes(searchQuery.toLowerCase())
//     );


//     const isChild = location.pathname.includes("single")
//     if (isChild) {
//         return <Outlet />
//     }

//     return (
//         <div className="w-full h-full flex flex-col bg-background">

//             {/* FLAT HEADER */}
//             <header className="shrink-0 px-6 py-5 border-b border-border flex flex-col md:flex-row md:items-end justify-between gap-4">
//                 <div>
//                     <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
//                         <i className="fas fa-chalkboard-user text-primary"></i>
//                         Teacher Assignments
//                     </h1>
//                     <p className="text-sm text-muted mt-1">Select a teacher below to manage their assigned classes and sections.</p>
//                 </div>
//                 <div className="w-full md:w-72">
//                     <Input
//                         placeholder="Search teachers..."
//                         leftIcon="fas fa-search"
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                         wrapperClassName="!mb-0"
//                     />
//                 </div>
//             </header>

//             {/* FULL WIDTH LIST */}
//             <div className="flex-1 overflow-y-auto custom-scrollbar">
//                 {isLoading ? (
//                     <div className="flex justify-center py-20"><i className="fas fa-circle-notch fa-spin text-3xl text-primary"></i></div>
//                 ) : isError ? (
//                     <div className="text-center py-20 text-danger">Failed to load teachers.</div>
//                 ) : filteredTeachers.length === 0 ? (
//                     <div className="text-center py-20 text-muted">No teachers found.</div>
//                 ) : (
//                     <table className="w-full text-left text-sm whitespace-nowrap">
//                         <thead className="sticky top-0 bg-surface border-b border-border text-xs uppercase tracking-wider text-muted font-bold shadow-sm z-10">
//                             <tr>
//                                 <th className="px-6 py-4">Teacher Name</th>
//                                 <th className="px-6 py-4">Email</th>
//                                 <th className="px-6 py-4">Total Assignments</th>
//                                 <th className="px-6 py-4 text-right">Action</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-border">
//                             {filteredTeachers.map((teacher: any) => (
//                                 <tr key={teacher._id} className="hover:bg-surface/50 transition-colors group">
//                                     <td className="px-6 py-4 font-semibold text-foreground flex items-center gap-3">
//                                         <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
//                                             {teacher.name?.charAt(0).toUpperCase()}
//                                         </div>
//                                         {teacher.name}
//                                     </td>
//                                     <td className="px-6 py-4 text-muted">{teacher.email || 'N/A'}</td>
//                                     <td className="px-6 py-4">
//                                         <span className="px-2.5 py-1 bg-surface border border-border rounded-md font-medium text-xs">
//                                             {teacher.assignments?.length || 0} Classes/Sections
//                                         </span>
//                                     </td>
//                                     <td className="px-6 py-4 text-right">
//                                         <Button
//                                             variant="outline"
//                                             size="sm"
//                                             className="opacity-0 group-hover:opacity-100 transition-opacity"
//                                             onClick={() => navigate(`single/${teacher._id}`)} // Navigates to TeacherAssignmentSingle
//                                         >
//                                             Manage
//                                         </Button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 )}
//             </div>
//         </div>
//     );
// }




import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData';
import { useGetAllUsers } from '../../api_services/auth_api/authApi';
import { Input } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';
import { TableContainer, TBody, Td, Th, THead, Tr } from '../../shared/ui/TableLayout';

export default function TeacherAssignmentMain() {
    const navigate = useNavigate();
    const { schoolId } = useAuthData();
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch Teachers
    const { data: teachersData, isLoading, isError } = useGetAllUsers({ role: 'teacher', schoolId: schoolId! });
    const teachers: any[] = teachersData || [];

    // Filter by search (Using userName based on your backend JSON)
    const filteredTeachers = teachers.filter((t: any) =>
        t.userName?.toLowerCase().includes(searchQuery.toLowerCase())
    );


    const isChild = location.pathname.includes("single")
    if (isChild) {
        return <Outlet />
    }

    return (
        <div className="w-full h-full flex flex-col bg-background">

            {/* FLAT HEADER */}
            <header className="shrink-0 px-6 py-5 border-b border-border flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-chalkboard-user text-primary"></i>
                        Teacher Assignments
                    </h1>
                    <p className="text-sm text-muted mt-1">Select a teacher below to manage their assigned classes and sections.</p>
                </div>
                <div className="w-full md:w-72">
                    <Input
                        placeholder="Search by name..."
                        leftIcon="fas fa-search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        wrapperClassName="!mb-0"
                    />
                </div>
            </header>

            {/* FULL WIDTH LIST (Using Custom Table Components) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {isLoading ? (
                    <div className="flex justify-center py-20"><i className="fas fa-circle-notch fa-spin text-3xl text-primary"></i></div>
                ) : isError ? (
                    <div className="text-center py-20 text-danger font-medium">Failed to load teachers.</div>
                ) : filteredTeachers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted">
                        <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
                            <i className="fas fa-users-slash text-2xl opacity-50"></i>
                        </div>
                        <p>No teachers found.</p>
                    </div>
                ) : (
<TableContainer className="h-full relative overflow-y-auto custom-scrollbar"><THead className="sticky top-0 z-10 shadow-sm">                            <tr>
                                <Th className="w-16">S.No</Th>
                                <Th>Teacher Name</Th>
                                <Th>Total Assignments</Th>
                                <Th className="text-right">Action</Th>
                            </tr>
                        </THead>
                        <TBody>
                            {filteredTeachers.map((teacher: any, index: number) => (
                                <Tr key={teacher._id}>
                                    {/* 1. S.No Column */}
                                    <Td className="text-muted font-medium">
                                        {index + 1}
                                    </Td>

                                    {/* 2. Profile/Name Column */}
                                    <Td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                                                {teacher.userName?.charAt(0).toUpperCase() || 'T'}
                                            </div>
                                            <span className="font-semibold text-foreground">{teacher.userName || 'Unnamed Teacher'}</span>
                                        </div>
                                    </Td>

                                    {/* 3. Total Assignments Column */}
                                    <Td>
                                        <span className="px-2.5 py-1 bg-background border border-border rounded-md font-medium text-xs text-muted shadow-sm">
                                            {teacher.assignments?.length || 0} Classes/Sections
                                        </span>
                                    </Td>

                                    {/* 4. Action Column (Always Visible) */}
                                    <Td className="text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(teacher._id)} // Navigates to TeacherAssignmentSingle
                                            leftIcon="fas fa-cog"
                                        >
                                            Manage
                                        </Button>
                                    </Td>
                                </Tr>
                            ))}
                        </TBody>
                    </TableContainer>
                )}
            </div>
        </div>
    );
}