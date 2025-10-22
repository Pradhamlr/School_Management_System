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
import StudentManagement from "./pages/admin/StudentManagement";
import TeacherManagement from "./pages/admin/TeacherManagement";
import Analytics from "./pages/admin/Analytics";
import ClassManagement from "./pages/admin/ClassManagement";
import EventManagement from "./pages/admin/EventManagement";
import FinanceManagement from "./pages/admin/FinanceManagement";
import ExamManagement from "./pages/admin/ExamManagement";
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
import TeacherClasses from "./pages/teacher/TeacherClasses";
import TeacherAssignments from "./pages/teacher/TeacherAssignments";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherTimetable from "./pages/teacher/TeacherTimetable";
import TeacherGrades from "./pages/teacher/TeacherGrades";

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
          <Route path="/admin/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute><EventManagement /></ProtectedRoute>} />
          <Route path="/admin/finance" element={<ProtectedRoute><FinanceManagement /></ProtectedRoute>} />
          <Route path="/admin/exams" element={<ProtectedRoute><ExamManagement /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute><ReportManagement /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute><NotificationManagement /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
          <Route path="/teacher-dashboard" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/classes" element={<ProtectedRoute><TeacherClasses /></ProtectedRoute>} />
          <Route path="/teacher/assignments" element={<ProtectedRoute><TeacherAssignments /></ProtectedRoute>} />
          <Route path="/teacher/attendance" element={<ProtectedRoute><TeacherAttendance /></ProtectedRoute>} />
          <Route path="/teacher/timetable" element={<ProtectedRoute><TeacherTimetable /></ProtectedRoute>} />
          <Route path="/teacher/grades" element={<ProtectedRoute><TeacherGrades /></ProtectedRoute>} />
          <Route path="/student-dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
          <Route path="/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/exams" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
          <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
