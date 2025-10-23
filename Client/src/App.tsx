import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import StudentDashboardNew from "./pages/StudentDashboardNew";
import StudentProfile from "./pages/StudentProfile";
import StudentAssignments from "./pages/StudentAssignments";
import StudentGrades from "./pages/StudentGrades";
import StudentTimetable from "./pages/StudentTimetable";
import StudentCourses from "./pages/StudentCourses";
import StudentExams from "./pages/StudentExams";
import StudentNotifications from "./pages/StudentNotifications";
import StudentAttendance from "./pages/StudentAttendance";
import StudentEvents from "./pages/StudentEvents";
import StudentManagement from "./pages/admin/StudentManagement";
import TeacherManagement from "./pages/admin/TeacherManagement";
import Analytics from "./pages/admin/Analytics";
import ClassManagement from "./pages/admin/ClassManagement";
import EventManagement from "./pages/admin/EventManagement";
import FinanceManagement from "./pages/admin/FinanceManagement";
import ExamManagement from "./pages/admin/ExamManagement";
import SubjectManagement from "./pages/admin/SubjectManagement";
import ReportManagement from "./pages/admin/ReportManagement";
import NotificationManagement from "./pages/admin/NotificationManagement";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Courses from "./pages/Courses";
import Events from "./pages/Events";
import Payments from "./pages/Payments";
import Exams from "./pages/Exams";
import Library from "./pages/Library";
import Settings from "./pages/Settings";
import TestPage from "./pages/TestPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login/:role" element={<Login />} />
          <Route path="/forgot-password/:role" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute><StudentManagement /></ProtectedRoute>} />
          <Route path="/admin/teachers" element={<ProtectedRoute><TeacherManagement /></ProtectedRoute>} />
          <Route path="/admin/classes" element={<ProtectedRoute><ClassManagement /></ProtectedRoute>} />
          <Route path="/admin/subjects" element={<ProtectedRoute><SubjectManagement /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute><EventManagement /></ProtectedRoute>} />
          <Route path="/admin/finance" element={<ProtectedRoute><FinanceManagement /></ProtectedRoute>} />
          <Route path="/admin/exams" element={<ProtectedRoute><ExamManagement /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute><ReportManagement /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute><NotificationManagement /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
          <Route path="/teacher-dashboard" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/student-dashboard" element={<ProtectedRoute requiredRole="student"><StudentDashboardNew /></ProtectedRoute>} />
          <Route path="/student-dashboard-new" element={<ProtectedRoute requiredRole="student"><StudentDashboardNew /></ProtectedRoute>} />
          <Route path="/student/profile" element={<ProtectedRoute requiredRole="student"><StudentProfile /></ProtectedRoute>} />
          <Route path="/student/assignments" element={<ProtectedRoute requiredRole="student"><StudentAssignments /></ProtectedRoute>} />
          <Route path="/student/grades" element={<ProtectedRoute requiredRole="student"><StudentGrades /></ProtectedRoute>} />
          <Route path="/student/timetable" element={<ProtectedRoute requiredRole="student"><StudentTimetable /></ProtectedRoute>} />
          <Route path="/student/courses" element={<ProtectedRoute requiredRole="student"><StudentCourses /></ProtectedRoute>} />
          <Route path="/student/exams" element={<ProtectedRoute requiredRole="student"><StudentExams /></ProtectedRoute>} />
          <Route path="/student/notifications" element={<ProtectedRoute requiredRole="student"><StudentNotifications /></ProtectedRoute>} />
          <Route path="/student/attendance" element={<ProtectedRoute requiredRole="student"><StudentAttendance /></ProtectedRoute>} />
          <Route path="/student/events" element={<ProtectedRoute requiredRole="student"><StudentEvents /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
          <Route path="/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/exams" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
          <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/test-page" element={<TestPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
