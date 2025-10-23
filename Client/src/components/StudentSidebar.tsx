import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  Trophy, 
  BookOpen, 
  Calendar, 
  CreditCard, 
  Library,
  Settings,
  Bell,
  Clock,
  Target,
  ChevronLeft,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { studentAPI, attendanceAPI, timetableAPI } from "@/lib/api";

const StudentSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [assignmentStats, setAssignmentStats] = useState({ completed: 0, total: 0 });
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [nextClass, setNextClass] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchSidebarData();
  }, []);

  const fetchSidebarData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const studentResponse = await studentAPI.getCurrentStudent();
      const studentId = studentResponse.data.id;

      // Fetch assignments
      const assignmentsResponse = await studentAPI.getStudentAssignments(studentId);
      const assignments = assignmentsResponse.data || [];
      const completed = assignments.filter((a: any) => a.submission?.status === 'SUBMITTED' || a.submission?.status === 'GRADED').length;
      setAssignmentStats({ completed, total: assignments.length });

      // Fetch attendance
      const attendanceResponse = await attendanceAPI.getStudentAttendance(studentId);
      const attendanceStats = attendanceResponse.data.data?.statistics;
      const rate = attendanceStats?.attendanceRate || 0;
      setAttendanceRate(rate);

      // Fetch next class from timetable
      const timetableResponse = await timetableAPI.getStudentTimetables(studentId);
      const timetables = timetableResponse.data || [];
      const now = new Date();
      const today = now.getDay();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const todayClasses = timetables.filter((t: any) => t.dayOfWeek === today);
      const upcomingClass = todayClasses.find((t: any) => {
        const [hours, minutes] = t.startTime.split(':').map(Number);
        const classTime = hours * 60 + minutes;
        return classTime > currentTime;
      });
      
      if (upcomingClass) {
        setNextClass(`${upcomingClass.subject.name} at ${upcomingClass.startTime}`);
      } else {
        setNextClass('No more classes today');
      }
    } catch (error) {
      console.error('Error fetching sidebar data:', error);
    }
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/student-dashboard-new",
      color: "text-purple-600"
    },
    {
      title: "My Profile",
      icon: User,
      path: "/student/profile",
      color: "text-blue-600"
    },
    {
      title: "Assignments",
      icon: FileText,
      path: "/student/assignments",
      color: "text-green-600"
    },
    {
      title: "Grades",
      icon: Trophy,
      path: "/student/grades",
      color: "text-yellow-600"
    },
    {
      title: "Courses",
      icon: BookOpen,
      path: "/student/courses",
      color: "text-indigo-600"
    },
    {
      title: "Timetable",
      icon: Calendar,
      path: "/student/timetable",
      color: "text-pink-600"
    },
    {
      title: "Events",
      icon: Calendar,
      path: "/student/events",
      color: "text-cyan-600"
    },
    {
      title: "Payments",
      icon: CreditCard,
      path: "/payments",
      color: "text-emerald-600"
    },
    {
      title: "Exams",
      icon: Target,
      path: "/student/exams",
      color: "text-orange-600"
    },
    {
      title: "Notifications",
      icon: Bell,
      path: "/student/notifications",
      color: "text-red-600"
    },
    {
      title: "Attendance",
      icon: Clock,
      path: "/student/attendance",
      color: "text-purple-600"
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/settings",
      color: "text-gray-600"
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={cn(
      "h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-lg",
      collapsed ? "w-16" : "w-72"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">ClassLinker</h2>
                <p className="text-xs text-gray-500">Student Portal</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 h-8 w-8"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Student Info */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">AT</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Alex Thompson</p>
              <p className="text-sm text-gray-600">Grade 12 - Science</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  GPA: 3.85
                </Badge>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  Rank: #5
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full justify-start gap-3 h-12 transition-all duration-200 relative",
                collapsed ? "px-2" : "px-3",
                active 
                  ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 shadow-sm" 
                  : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 flex-shrink-0",
                active ? "text-blue-600" : item.color
              )} />
              {!collapsed && (
                <span className="font-medium">{item.title}</span>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Quick Stats */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">This Week</span>
              <span className="font-medium text-gray-900">Progress</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Assignments</span>
                <span className="text-green-600 font-medium">{assignmentStats.completed}/{assignmentStats.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${assignmentStats.total > 0 ? (assignmentStats.completed / assignmentStats.total) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Attendance</span>
                <span className="text-blue-600 font-medium">{attendanceRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${attendanceRate}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Help Section */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5" />
              <h3 className="font-semibold text-sm">Academic Goal</h3>
            </div>
            <p className="text-xs text-blue-100 mb-3">
              Maintain GPA above 3.8 this semester
            </p>
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <div className="bg-white h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <p className="text-xs text-blue-100">85% towards goal</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSidebar;