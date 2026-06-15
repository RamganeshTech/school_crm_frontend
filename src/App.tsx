// import './App.css'
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'


// import LoginSelection from './Pages/LoginGroup/LoginSelection'
// import React, { Suspense } from 'react';

// import AdminLogin from './Pages/Admin/AdminLogin/AdminLogin';
// import MainLoading from './components/MainLoading/MainLoading';
// import SingleStudentProfile from './components/StudentProfile/SingleStudentProfile';
// import AccountDeletion from './Pages/AccountDeletion/AccountDeletion';
// import PrivacyPolicy from './Pages/PrivacyPolicy/PrivacyPolicy';
// import Login from './pages/auth/Login';
// import { ToastProvider } from './shared/ui/ToastContext';

import { lazy, Suspense } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from './shared/ui/ToastContext';
import { useAuthCheck } from './hooks/useAuthCheck';
import { ACADEMIC_ACCESS, AUTH_CHECK_ROLES, FINANCE_ACCESS, HIGHER_OFFICIALS, MANAGEMENT_ONLY, STAFF_ALL, SUPER_ADMIN_ONLY } from './constants/constants';
import { SocketProvider } from './lib/SocketContext';
import { DashboardHomeRedirect } from './pages/Dashboard/DashboardRedirect';
const FeeCollectionMain = lazy(() => import( './pages/fee_collection_pages/FeeCollectionMain'));
const FeeCollectionSingle = lazy(() => import( './pages/fee_collection_pages/FeeCollectionSingle'));
const FeeStructureConfig = lazy(() => import('./pages/feeStructure_config/FeeStructureConfig'));
const AttendanceAnalyticsDashboard = lazy(() => import('./pages/attendance/AttendanceAnalyticsDashboard'));
const AttendanceSchoolWideYearlyAnalytics = lazy(() => import('./pages/attendance/components/AttendaceSchoolWideYearlyAnalytics'));
const AttendanceClassSpecificYearlyAnalytics = lazy(() => import('./pages/attendance/components/AttendanceClassSpecificYearlyAnalytics'));


const UserProfile = lazy(() => import('./pages/profile/UserProfile'));
const DashboardChildrens = lazy(() => import('./pages/Dashboard/DashboardChildrens'));
const ClassConfiguration = lazy(() => import('./pages/class/ClassConfiguration'));
const SectionConfiguration = lazy(() => import('./pages/section/SectionConfiguration'));
const SchoolListMain = lazy(() => import('./pages/school/SchoolListMain'));
const SchoolConfiguration = lazy(() => import('./pages/school/SchoolConfiguration'));
const Login = lazy(() => import('./pages/auth/Login'));
const PrivacyPolicy = lazy(() => import('./pages/confidentials/PrivacyPolicy'));
const AccountDeletion = lazy(() => import('./pages/confidentials/AccountDeletion/AccountDeletion'));
const NotFound = lazy(() => import('./pages/Not Found/NotFound'));
const StudentMain = lazy(() => import('./pages/student_pages/StudentMain_Pages/StudentMain'));
const AttendanceMain = lazy(() => import('./pages/attendance/AttendanceMain'));
const StudentRecordMain = lazy(() => import('./pages/student_pages/StudentRecord_Pages/StudentRecordMain'));
const StudentRecordSingle = lazy(() => import('./pages/student_pages/StudentRecord_Pages/StudentRecordSingle'));
const FeeTransactionMain = lazy(() => import('./pages/feeTransaction/FeeTransactionMain'));
const StudentSingle = lazy(() => import('./pages/student_pages/StudentMain_Pages/StudentSingle'));
const TeacherAssignmentMain = lazy(() => import('./pages/teacherAssignment/TeacherAssignmentMain'));
const TeacherAssignmentSingle = lazy(() => import('./pages/teacherAssignment/TeacherAssignmentSingle'));
const TimeTableMain = lazy(() => import('./pages/timetable/TimeTableMain'));
const ExpenseMain = lazy(() => import('./pages/expense/ExpenseMain'));
const ExpenseSingle = lazy(() => import('./pages/expense/ExpenseSingle'));
const HomeworkMain = lazy(() => import('./pages/homework/HomeWorkMain'));
const HomeworkSubmissionMain = lazy(() => import('./pages/homework/HomeworkSubmissionMain'));
const FinanceLedgerMain = lazy(() => import('./pages/finance/FinanceLedgerMain'));
const DeleteArchiveMain = lazy(() => import('./pages/deleteArchieve/DeleteArchiveMain'));
const AuditMain = lazy(() => import('./pages/audit/AuditMain'));
const AnnouncementMain = lazy(() => import('./pages/annoucement/AnnouncementMain'));
const AnnouncementConfig = lazy(() => import('./pages/annoucement/AnnouncementConfig'));
const ClubMain = lazy(() => import('./pages/clubs/clubs_main/ClubMain'));
const ClubSingle = lazy(() => import('./pages/clubs/clubs_main/ClubSingle'));
const FeeStructureMain = lazy(() => import('./pages/feeStructure/FeeStructureMain'));
const FeeStructureSingle = lazy(() => import('./pages/feeStructure/FeeStructureSingle'));
const ProtectedRoute = lazy(() => import('./shared/components/ProtectedRoute'));
const ParentProfileSelection = lazy(() => import('./pages/parentPages/parentProfileSelection/ParentProfileSelection'));
const AttendanceSingleStudent = lazy(() => import('./pages/attendance/AttendanceSingleStudent'));
const MarkReportMain = lazy(() => import('./pages/markReports/MarkReportMain'));
const MarkReportConfig = lazy(() => import('./pages/markReports/MarkReportConfig'));
const AnnouncementParentMain = lazy(() => import('./pages/annoucement/AnnouncementParentMain'));
const FinanceDashboardMain = lazy(() => import('./pages/reports/FinanceDashboardMain'));
const MarkReportConfigMain = lazy(() => import('./pages/markReports/markReportConfig/MarkReportConfigMain'));
const Home = lazy(() => import('./pages/landing_page/Home'));
const UserListMain = lazy(() => import('./pages/userList/UserListMain'));
const PendingTaskListMain = lazy(() => import('./pages/pendingTask/PendingTaskListMain'));
const SubscriptionMain = lazy(() => import('./pages/subscripiton/SubscriptionMain'));
const ForgotPasswordMain = lazy(() => import('./pages/auth/ForgotPasswordMain'));
const ResetPasswordMain = lazy(() => import('./pages/auth/ResetPasswordMain'));
const StudentProfileUpdateMain = lazy(() => import('./pages/student_pages/StudentMain_Pages/StudentProfileUpdateMain'));
const ClubQuizMain = lazy(() => import('./pages/clubs/clubs_quiz/ClubQuizMain'));
const ClubQuizAttempt = lazy(() => import('./pages/clubs/clubs_quiz/ClubQuizAttempt'));
// import PendingTasksList from './pages/pendingTask/PendingTasksList';

// const AccountantPermission = React.lazy(() => import('./Pages/Admin/Reports/AccountantPermission/AccountantPermission'));
// const Accountant = React.lazy(() => import('./Pages/Accountant/Accountant'));
// const NotFound = React.lazy(() => import('./Pages/Not Found/NotFound'));
// const AddDetail = React.lazy(() => import('./Pages/Accountant/AddDetails/AddDetail'));
// const AdminHome = React.lazy(() => import('./Pages/Admin/AdminHome/AdminHome'));
// const AdminStudent = React.lazy(() => import('./Pages/Admin/AdminStudent/AdminStudent'));
// const AccountantLoginCreation = React.lazy(() => import('./Pages/Admin/AccountantLoginCreation/AccountantLoginCreation'));
// const DeletedCredential = React.lazy(() => import('./Pages/Admin/DeletedLoginCredentials/DeletedCredential'));

// const AdminNotification = React.lazy(() => import('./Pages/Admin/AdminNotification/AdminNotification'));

// const ProtectedRoute = React.lazy(() => import('./components/ProtectedRoute/ProtectedRoute'));

// const Reports = React.lazy(() => import('./Pages/Admin/Reports/Reports'))




// interface ErrorBoundaryProps {
//   children: React.ReactNode;
// }
// interface ErrorBoundaryState {
//   hasError: boolean;
// }
// class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
//   constructor(props: ErrorBoundaryProps) {
//     super(props);
//     this.state = { hasError: false };
//   }

//   static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
//     console.log(error)
//     return { hasError: true };
//   }

//   componentDidCatch(error: Error, info: React.ErrorInfo) {
//     console.error("Error boundary caught an error:", error, info);
//   }

//   render() {
//     if (this.state.hasError) {
//       return <h1>Something went wrong from error boudary.</h1>;
//     }
//     return this.props.children;
//   }
// }


function App() {

  const { isLoading } = useAuthCheck();

  // Show a clean loading screen while verifying the session
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
          <p className="text-muted text-sm font-medium tracking-wide">
            Verifying Session...
          </p>
        </div>
      </div>
    );
  }



  const PARENT_ROLE = AUTH_CHECK_ROLES

  return (
    <>
      <Router>
        <SocketProvider>
          <Suspense fallback={
            <section className='w-full h-full flex items-center justify-center'>
              <div className="flex justify-center items-center py-8">
                <i className="fas fa-circle-notch fa-spin text-primary text-4xl"></i>
              </div>
            </section>
          }>
            {/* <ErrorBoundary> */}
            {/* <ToastProvider> */}
            <Routes >
              {/* <Route index element={<LoginSelection />} /> */}

              <Route index path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPasswordMain />} />
              <Route path="/reset-password/:id/:token" element={<ResetPasswordMain />} />

              <Route path="/profile" element={<UserProfile />} />






              <Route path='/dashboard' element={<DashboardChildrens />}>
                <Route index element={<DashboardHomeRedirect />} />

                <Route path="dashboard-main" element={<ProtectedRoute allowedRoles={STAFF_ALL} ><FinanceDashboardMain /></ProtectedRoute>} />

                <Route element={<ProtectedRoute allowedRoles={PARENT_ROLE} />}>
                  {/* <Route path="profile-selection" element={<ParentProfileSelection />} > */}

                  {/* before student selection */}
                  <Route path="profile-selection" element={<ParentProfileSelection />} />

                  <Route path="parent/profile" element={<UserProfile />} />
                  <Route path="student/main-profile/:id" element={<StudentSingle />} />
                  <Route path="student/record-profile/:studentId" element={<StudentRecordSingle />} >
                    <Route path="fee-transaction" element={<FeeTransactionMain />} />
                  </Route>
                  <Route path="student/attendace/:studentId" element={<AttendanceSingleStudent />} />

                  <Route path="student/homework-submission" element={<HomeworkSubmissionMain />} />

                  <Route path="student/announcement" element={<AnnouncementParentMain />} />
                  <Route path="student/pending-task" element={<PendingTaskListMain />} />

                  <Route path="student/club" element={<ClubMain />} >
                    <Route path="single/:id" element={<ClubSingle />} >
                      <Route path="quiz/:videoId" element={<ClubQuizMain />} >
                        <Route path="attempt/:quizId" element={<ClubQuizAttempt />} />
                      </Route>
                    </Route>
                  </Route>

                  <Route path="student/markreport/:id" element={<MarkReportConfig />} />


                  {/* </Route> */}
                </Route>



                {/* ========================================== */}
                {/* STAFF: GLOBAL ACCESS (All Staff Roles)     */}
                {/* ========================================== */}
                <Route element={<ProtectedRoute allowedRoles={STAFF_ALL} />}>
                  <Route path="profile" element={<UserProfile />} />


                  <Route path="student-record" element={<StudentRecordMain />} >
                    <Route path="single/:studentId" element={<StudentRecordSingle />} >
                      <Route path="fee-transaction" element={<FeeTransactionMain />} />
                    </Route>
                  </Route>
                </Route>



                {/* ========================================== */}
                {/* STAFF: SUPER ADMIN ONLY                    */}
                {/* ========================================== */}

                <Route element={<ProtectedRoute allowedRoles={SUPER_ADMIN_ONLY} />}>
                  <Route path="user-list" element={<UserListMain />} />
                  <Route path="school-list" element={<SchoolListMain />} />
                </Route>



                {/* ========================================== */}
                {/* STAFF: FINANCE & MANAGEMENT                */}
                {/* ========================================== */}
                <Route element={<ProtectedRoute allowedRoles={FINANCE_ACCESS} />}>
                  <Route path="class" element={<ClassConfiguration />} />
                  <Route path="section" element={<SectionConfiguration />} />
                  <Route path="school" element={<SchoolConfiguration />} />


                  <Route path="student" element={<StudentMain />} >
                    <Route path="profile/:id" element={<StudentSingle />} >
                      <Route path="pending-update" element={<StudentProfileUpdateMain />} />
                    </Route>
                  </Route>


                  <Route path="expense" element={<ExpenseMain />}>
                    <Route path="single/:id" element={<ExpenseSingle />} />
                  </Route>

                  <Route path="finance" element={<FinanceLedgerMain />} />
                  <Route path="fee-structure" element={<FeeStructureMain />}>
                    <Route path="single/:classId" element={<FeeStructureSingle />} />
                  </Route>
                  <Route path="fee-configuration" element={<FeeStructureConfig />} />



                  <Route path="fee-collection" element={<FeeCollectionMain />} >
                    <Route path="single/:studentId" element={<FeeCollectionSingle />} />
                  </Route>

                </Route>

                <Route element={<ProtectedRoute allowedRoles={HIGHER_OFFICIALS} />}>
                  <Route path="subscription" element={<SubscriptionMain />} />
                </Route>



                {/* ========================================== */}
                {/* STAFF: ACADEMIC & MANAGEMENT               */}
                {/* ========================================== */}

                <Route element={<ProtectedRoute allowedRoles={ACADEMIC_ACCESS} />}>
                  <Route path="attendance" element={<AttendanceMain />} />
                  <Route path="attendance-report" element={<AttendanceAnalyticsDashboard />} />
                  <Route path="attendance-year" element={<AttendanceSchoolWideYearlyAnalytics />} />
                  <Route path="attendance-class" element={<AttendanceClassSpecificYearlyAnalytics />} />
                  <Route path="homework" element={<HomeworkMain />} />
                  <Route path="homework-submission" element={<HomeworkSubmissionMain />} />

                  <Route path="teacher-assignment" element={<TeacherAssignmentMain />}>
                    <Route path="single/:id" element={<TeacherAssignmentSingle />} />
                  </Route>

                  <Route path="markreport-config" element={<MarkReportConfigMain />} />
                  <Route path="markreport" element={<MarkReportMain />} >
                    <Route path="single/:id" element={<MarkReportConfig />} />
                    <Route path="create" element={<MarkReportConfig />} />
                  </Route>
                </Route>

                {/* ========================================== */}
                {/* STAFF: MANAGEMENT OPERATIONS               */}
                {/* ========================================== */}
                <Route element={<ProtectedRoute allowedRoles={MANAGEMENT_ONLY} />}>
                  <Route path="school" element={<SchoolConfiguration />} /> {/* Current school settings */}
                  <Route path="timetable" element={<TimeTableMain />} />
                  <Route path="audit" element={<AuditMain />} />
                  <Route path="delete-archive" element={<DeleteArchiveMain />} />

                  <Route path="club" element={<ClubMain />}>
                    <Route path="single/:id" element={<ClubSingle />} >
                      <Route path="quiz/:videoId" element={<ClubQuizMain />} >
                        <Route path="attempt/:quizId" element={<ClubQuizAttempt />} />
                      </Route>
                    </Route>
                  </Route>
                  <Route path="announcement" element={<AnnouncementMain />}>
                    <Route path="single/:id" element={<AnnouncementConfig />} />
                    <Route path="create" element={<AnnouncementConfig />} />
                  </Route>
                </Route>


                <Route element={<ProtectedRoute allowedRoles={MANAGEMENT_ONLY} />}>

                </Route>

                {/* <Route path="timetable" element={<TimeTableMain />} />
                <Route path="homework" element={<HomeworkMain />} />
                <Route path="homework-submission" element={<HomeworkSubmissionMain />} />
                <Route path="attendance" element={<AttendanceMain />} />


                <Route path="teacher-assignment" element={<TeacherAssignmentMain />}>
                  <Route path="single/:id" element={<TeacherAssignmentSingle />} />
                </Route>




                <Route path="markreport-config" element={<MarkReportConfigMain />} />
                <Route path="markreport" element={<MarkReportMain />} >
                  <Route path="single/:id" element={<MarkReportConfig />} />
                  <Route path="create" element={<MarkReportConfig />} />
                </Route>


                <Route path="fee-structure" element={<FeeStructureMain />}>
                  <Route path="single/:classId" element={<FeeStructureSingle />} />
                </Route>

                <Route path="club" element={<ClubMain />}>
                  <Route path="single/:id" element={<ClubSingle />} />
                </Route>


                <Route path="announcement" element={<AnnouncementMain />}>
                  <Route path="single/:id" element={<AnnouncementConfig />} />
                  <Route path="create" element={<AnnouncementConfig />} />
                </Route>


                <Route path="finance" element={<FinanceLedgerMain />} />
                <Route path="delete-archive" element={<DeleteArchiveMain />} />
                <Route path="audit" element={<AuditMain />} />
 */}


              </Route>

              {/* </Route> */}


              {/* <Route path='/accountantlogin' element={<AdminLogin />} />
              <Route path='/adminlogin' element={<AdminLogin />} />


              <Route path='/accountant' element={<ProtectedRoute userType="accountant" element={<Accountant />} />}>
                <Route index element={<ProtectedRoute userType="accountant" element={<AddDetail />} />} />
                <Route path="singlestudentprofile/:id" element={<ProtectedRoute userType="accountant" element={<SingleStudentProfile />} />} />
                <Route path="reports" element={<ProtectedRoute userType="accountant" element={<Reports />} />} />
              </Route>

              <Route path='/admin' element={<ProtectedRoute userType="admin" element={<AdminHome />} />} >
                <Route index element={<ProtectedRoute userType="admin" element={<AdminStudent />} />} />
                <Route path="singlestudentprofile/:id" element={<ProtectedRoute userType="admin" element={<SingleStudentProfile />} />} />
                <Route path="notification" element={<ProtectedRoute userType="admin" element={<AdminNotification />} />} />
                <Route path="Accountantlogincredentials" element={<ProtectedRoute userType="admin" element={<AccountantLoginCreation />} />} />
                <Route path="deletedcredentials" element={<ProtectedRoute userType="admin" element={<DeletedCredential />} />} />
                <Route path="reports" element={<ProtectedRoute userType="admin" element={<Reports />} />} />
                <Route path="viewpermissionlist" element={<ProtectedRoute userType="admin" element={<AccountantPermission />} />} />
              </Route>
 */}


              <Route path='/privacy-policy' element={<PrivacyPolicy />} />
              <Route path='/account-deletion' element={<AccountDeletion />} />
              <Route path='*' element={<NotFound />} />

            </Routes>

            <ToastContainer />

            {/* </ToastProvider> */}
            {/* </ErrorBoundary> */}
          </Suspense >
        </SocketProvider>
      </Router >
    </>
  )
}


export default App 