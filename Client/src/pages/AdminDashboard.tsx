import { Users, GraduationCap, BookOpen, Calendar, Settings, BarChart3 } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricCard } from "@/components/MetricCard";
import { AttendanceChart } from "@/components/AttendanceChart";

const AdminDashboard = () => {
  const studentAttendanceData = [
    { name: "Present", value: 78, color: "#6366F1" },
    { name: "Absent", value: 22, color: "#EF4444" },
  ];

  const teacherAttendanceData = [
    { name: "Present", value: 92, color: "#EC4899" },
    { name: "Absent", value: 8, color: "#EF4444" },
  ];

  const classPerformanceData = [
    { name: "Excellent", value: 45, color: "#10B981" },
    { name: "Good", value: 35, color: "#F59E0B" },
    { name: "Average", value: 20, color: "#EF4444" },
  ];

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      
      <div className="flex-1">
        <DashboardHeader />
        
        <main className="p-8 space-y-8">
          <div className="glass-card rounded-3xl p-8 bg-gradient-to-r from-purple-500/10 to-purple-600/10">
            <h1 className="text-4xl font-bold text-purple-800 mb-4">
              Admin Dashboard
            </h1>
            <p className="text-lg text-purple-600">
              Complete system overview and management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Students"
              value="5,252"
              icon={Users}
              color="hsl(270 100% 75%)"
              trend={{ value: "12.5%", isPositive: true }}
            />
            <MetricCard
              title="Total Teachers"
              value="132"
              icon={GraduationCap}
              color="hsl(330 100% 75%)"
              trend={{ value: "8.2%", isPositive: true }}
            />
            <MetricCard
              title="Total Courses"
              value="15"
              icon={BookOpen}
              color="hsl(210 100% 75%)"
              trend={{ value: "3.1%", isPositive: false }}
            />
            <MetricCard
              title="System Health"
              value="98%"
              icon={Settings}
              color="hsl(120 100% 75%)"
              trend={{ value: "2.0%", isPositive: true }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AttendanceChart
              title="Students Attendance"
              data={studentAttendanceData}
              size="lg"
            />
            <AttendanceChart
              title="Teachers Attendance"
              data={teacherAttendanceData}
              size="lg"
            />
            <AttendanceChart
              title="Class Performance"
              data={classPerformanceData}
              size="lg"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;