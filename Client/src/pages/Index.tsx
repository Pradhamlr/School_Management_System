import { Users, GraduationCap, BookOpen, Calendar } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricCard } from "@/components/MetricCard";
import { AttendanceChart } from "@/components/AttendanceChart";
import { Calendar as CalendarComponent } from "@/components/Calendar";
import educationHero from "@/assets/education-hero.png";

const Index = () => {
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
          {/* Hero Section */}
          <div className="glass-card rounded-3xl p-8 bg-gradient-to-r from-primary/10 to-accent/10 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="space-y-4 max-w-2xl">
                <h1 className="text-4xl font-bold gradient-text">
                  Educational Management Software
                </h1>
                <p className="text-lg text-muted-foreground">
                  UI/UX Case Study - Comprehensive dashboard for managing educational institutions
                </p>
                <div className="flex items-center gap-6 pt-4">
                  <div>
                    <p className="text-2xl font-bold text-foreground">ClassLinker</p>
                    <p className="text-sm text-muted-foreground">Educational Institute Management</p>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <img 
                  src={educationHero} 
                  alt="Educational illustration" 
                  className="w-80 h-60 object-contain"
                />
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
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
              title="Events this month"
              value="10"
              icon={Calendar}
              color="hsl(25 100% 75%)"
              trend={{ value: "25.0%", isPositive: true }}
            />
          </div>

          {/* Charts and Calendar */}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CalendarComponent />
            
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activities</h3>
              <div className="space-y-4">
                {[
                  { title: "New student enrollment", time: "2 hours ago", type: "success" },
                  { title: "Exam results published", time: "4 hours ago", type: "info" },
                  { title: "Teacher meeting scheduled", time: "6 hours ago", type: "warning" },
                  { title: "Fee payment received", time: "8 hours ago", type: "success" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className={`w-3 h-3 rounded-full ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'info' ? 'bg-blue-500' : 'bg-orange-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
