import { 
  LayoutDashboard, 
  Users, 
  GraduationCap,
  BookOpen,
  Calendar,
  CreditCard,
  BarChart3,
  Library,
  Settings
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navigationItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Students", icon: Users, href: "/students" },
  { name: "Teachers", icon: GraduationCap, href: "/teachers" },
  { name: "Courses", icon: BookOpen, href: "/courses" },
  { name: "Events", icon: Calendar, href: "/events" },
  { name: "Fee and Payments", icon: CreditCard, href: "/payments" },
  { name: "Exams and Results", icon: BarChart3, href: "/exams" },
  { name: "Library", icon: Library, href: "/library" },
];

export function DashboardSidebar() {
  return (
    <div className="w-72 min-h-screen glass-card border-r border-border/50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">ClassLinker</h1>
            <p className="text-sm text-muted-foreground">Education Management</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-white shadow-lg"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 pt-6 border-t border-border/50">
          <NavLink
            to="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
}