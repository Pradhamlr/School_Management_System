import { Users, BookOpen, Calendar, CheckSquare, FileText, Clock } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricCard } from "@/components/MetricCard";
import { AttendanceChart } from "@/components/AttendanceChart";

const TeacherDashboard = () => {
  const classAttendanceData = [
    { name: "Present", value: 85, color: "#10B981" },
    { name: "Absent", value: 15, color: "#EF4444" },
  ];

  const assignmentStatusData = [
    { name: "Submitted", value: 70, color: "#6366F1" },
    { name: "Pending", value: 30, color: "#F59E0B" },
  ];

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      
      <div className="flex-1">
        <DashboardHeader />
        
        <main className="p-8 space-y-8">
          <div className="glass-card rounded-3xl p-8 bg-gradient-to-r from-green-500/10 to-green-600/10">
            <h1 className="text-4xl font-bold text-green-800 mb-4">
              Teacher Dashboard
            </h1>
            <p className="text-lg text-green-600">
              Manage your classes, assignments, and student progress
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="My Students"
              value="156"
              icon={Users}
              color="hsl(142 100% 75%)"
              trend={{ value: "5.2%", isPositive: true }}
            />
            <MetricCard
              title="Active Courses"
              value="4"
              icon={BookOpen}
              color="hsl(210 100% 75%)"
              trend={{ value: "0%", isPositive: true }}
            />
            <MetricCard
              title="Pending Assignments"
              value="12"
              icon={FileText}
              color="hsl(45 100% 75%)"
              trend={{ value: "8.3%", isPositive: false }}
            />
            <MetricCard
              title="Classes Today"
              value="6"
              icon={Clock}
              color="hsl(330 100% 75%)"
              trend={{ value: "0%", isPositive: true }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AttendanceChart
              title="Class Attendance Today"
              data={classAttendanceData}
              size="lg"
            />
            <AttendanceChart
              title="Assignment Submissions"
              data={assignmentStatusData}
              size="lg"
            />
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Today's Schedule</h3>
            <div className="space-y-4">
              {[
                { time: "09:00 AM", subject: "Mathematics", class: "10-A", room: "Room 101" },
                { time: "10:30 AM", subject: "Physics", class: "11-A", room: "Lab 1" },
                { time: "12:00 PM", subject: "Mathematics", class: "10-B", room: "Room 102" },
                { time: "02:00 PM", subject: "Physics", class: "12-A", room: "Lab 2" },
              ].map((schedule, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
                  <div className="w-20 text-sm font-medium text-green-600">{schedule.time}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{schedule.subject} - {schedule.class}</p>
                    <p className="text-xs text-muted-foreground">{schedule.room}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;