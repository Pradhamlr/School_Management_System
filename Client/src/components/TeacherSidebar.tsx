import { 
  LayoutDashboard, 
  Users, 
  BookOpen,
  Calendar,
  FileText,
  CheckSquare,
  BarChart3,
  Clock,
  Settings,
  GraduationCap
} from "lucide-react";
import { NavLink } from "react-router-dom";

const teacherNavigationItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/teacher-dashboard" },
  { name: "My Classes", icon: Users, href: "/teacher/classes" },
  { name: "Assignments", icon: FileText, href: "/teacher/assignments" },
  { name: "Attendance", icon: CheckSquare, href: "/teacher/attendance" },
  { name: "Timetable", icon: Clock, href: "/teacher/timetable" },
  { name: "Grades", icon: BarChart3, href: "/teacher/grades" },
];

export function TeacherSidebar() {
  return (
    <div className="w-72 min-h-screen glass-card border-r border-border/50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">ClassLinker</h1>
            <p className="text-sm text-muted-foreground">Teacher Portal</p>
          </div>
        </div>

        <nav className="space-y-2">
          {teacherNavigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Settings removed for teachers; admin-only settings available in Admin panel */}
      </div>
    </div>
  );
}