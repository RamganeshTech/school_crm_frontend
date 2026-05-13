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


import UserProfile from './pages/profile/UserProfile';
import DashboardChildrens from './pages/Dashboard/DashboardChildrens';
import { useAuthCheck } from './hooks/useAuthCheck';
import ClassConfiguration from './pages/class/ClassConfiguration';
import SectionConfiguration from './pages/section/SectionConfiguration';
import SchoolListMain from './pages/school/SchoolListMain';
import SchoolConfiguration from './pages/school/SchoolConfiguration';
import { Suspense } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from './pages/auth/Login';
import PrivacyPolicy from './pages/confidentials/PrivacyPolicy';
import AccountDeletion from './pages/confidentials/AccountDeletion/AccountDeletion';
import NotFound from './pages/Not Found/NotFound';
import StudentMain from './pages/student_pages/StudentMain_Pages/StudentMain';
import AttendanceMain from './pages/attendance/AttendanceMain';
import StudentRecordMain from './pages/student_pages/StudentRecord_Pages/StudentRecordMain';
import StudentRecordSingle from './pages/student_pages/StudentRecord_Pages/StudentRecordSingle';
import { ToastContainer } from './shared/ui/ToastContext';
import FeeTransactionMain from './pages/feeTransaction/FeeTransactionMain';
import StudentSingle from './pages/student_pages/StudentMain_Pages/StudentSingle';
import TeacherAssignmentMain from './pages/teacherAssignment/TeacherAssignmentMain';
import TeacherAssignmentSingle from './pages/teacherAssignment/TeacherAssignmentSingle';
import TimeTableMain from './pages/timetable/TimeTableMain';
import ExpenseMain from './pages/expense/ExpenseMain';
import ExpenseSingle from './pages/expense/ExpenseSingle';
import HomeworkMain from './pages/homework/HomeWorkMain';
import HomeworkSubmissionMain from './pages/homework/HomeworkSubmissionMain';
import FinanceLedgerMain from './pages/finance/FinanceLedgerMain';
import DeleteArchiveMain from './pages/deleteArchieve/DeleteArchiveMain';
import AuditMain from './pages/audit/AuditMain';
import AnnouncementMain from './pages/annoucement/AnnouncementMain';
import AnnouncementConfig from './pages/annoucement/AnnouncementConfig';
import ClubMain from './pages/clubs/clubs_main/ClubMain';
import ClubSingle from './pages/clubs/clubs_main/ClubSingle';

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

  return (
    <>
      <Router>
        <Suspense fallback={<p>loading...</p>}>
          {/* <ErrorBoundary> */}
          {/* <ToastProvider> */}
          <Routes >
            {/* <Route index element={<LoginSelection />} /> */}

            <Route index path="/login" element={<Login />} />
            <Route path="/profile" element={<UserProfile />} />



            <Route path='/dashboard' element={<DashboardChildrens />}>
              <Route index path="profile" element={<UserProfile />} />
              <Route path="class" element={<ClassConfiguration />} />
              <Route path="section" element={<SectionConfiguration />} />
              <Route path="school" element={<SchoolConfiguration />} />
              <Route path="school-list" element={<SchoolListMain />} />
              <Route path="timetable" element={<TimeTableMain />} />
              <Route path="expense" element={<ExpenseMain />} >
                <Route path="single/:id" element={<ExpenseSingle />} />
              </Route>
              <Route path="homework" element={<HomeworkMain />} />
              <Route path="homework-submission" element={<HomeworkSubmissionMain />} />
              <Route path="student" element={<StudentMain />} >
                <Route path="profile/:id" element={<StudentSingle />} />

              </Route>
              <Route path="attendance" element={<AttendanceMain />} />
              <Route path="teacher-assignment" element={<TeacherAssignmentMain />} >

                <Route path="single/:id" element={<TeacherAssignmentSingle />} />

              </Route>
              <Route path="student-record" element={<StudentRecordMain />} >
                <Route path="single/:studentId" element={<StudentRecordSingle />} >
                  <Route path="fee-transaction" element={<FeeTransactionMain />} />
                </Route>
              </Route>
              <Route path="finance" element={<FinanceLedgerMain />} />
              <Route path="delete-archive" element={<DeleteArchiveMain />} />
              <Route path="audit" element={<AuditMain />} />
              <Route path="club" element={<ClubMain />} >
                <Route path="single/:id" element={<ClubSingle />} />

              </Route>
              <Route path="announcement" element={<AnnouncementMain />} >
                <Route path="single/:id" element={<AnnouncementConfig />} />
                <Route path="create" element={<AnnouncementConfig />} />
              </Route>

            </Route>


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
      </Router>
    </>
  )
}


export default App 