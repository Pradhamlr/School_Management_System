import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  BarChart3, 
  Calendar, 
  DollarSign, 
  Settings, 
  Bell,
  FileText,
  Award,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin-dashboard",
      color: "text-purple-600"
    },
    {
      title: "Students",
      icon: Users,
      path: "/admin/students",
      color: "text-blue-600"
    },
    {
      title: "Teachers",
      icon: GraduationCap,
      path: "/admin/teachers",
      color: "text-green-600"
    },
    {
      title: "Classes",
      icon: BookOpen,
      path: "/admin/classes",
      color: "text-orange-600"
    },
    {
      title: "Subjects",
      icon: BookOpen,
      path: "/admin/subjects",
      color: "text-teal-600"
    },
    {
      title: "Timetables",
      icon: Calendar,
      path: "/admin/timetables",
      color: "text-pink-600"
    },
    {
      title: "Analytics",
      icon: BarChart3,
      path: "/admin/analytics",
      color: "text-indigo-600"
    },
    {
      title: "Events",
      icon: Calendar,
      path: "/admin/events",
      color: "text-pink-600"
    },
    // Finance removed per user request
    // Exams and Reports removed per request; functionality moved to Settings
    {
      title: "Notifications",
      icon: Bell,
      path: "/admin/notifications",
      color: "text-red-600"
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/admin/settings",
      color: "text-gray-600"
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={cn(
      "h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 transition-all duration-300 flex flex-col shadow-lg",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AC</span>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">Acadion</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
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

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full justify-start gap-3 h-11 transition-all duration-200",
                collapsed ? "px-2" : "px-3",
                active 
                  ? "bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 shadow-sm" 
                  : "hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 flex-shrink-0",
                active ? "text-purple-600" : item.color
              )} />
              {!collapsed && (
                <span className="font-medium">{item.title}</span>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-3 text-white">
            <h3 className="font-semibold text-sm">Need Help?</h3>
            <p className="text-xs text-purple-100 mt-1">
              Contact support for assistance
            </p>
            <Button 
              size="sm" 
              className="mt-2 bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Get Support
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar;