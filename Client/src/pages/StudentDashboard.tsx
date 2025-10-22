import { BookOpen, Calendar, FileText, Trophy, Clock, Target, Users } from "lucide-react";
import StudentSidebar from "@/components/StudentSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricCard } from "@/components/MetricCard";
import { AttendanceChart } from "@/components/AttendanceChart";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';

const StudentDashboard = () => {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const attendanceData = analytics ? [
    { name: 'Present', value: Number(analytics.attendance.studentAttendanceRate) || 0, color: '#10B981' },
    { name: 'Absent', value: 100 - (Number(analytics.attendance.studentAttendanceRate) || 0), color: '#EF4444' },
  ] : [
    { name: "Present", value: 0, color: "#10B981" },
    { name: "Absent", value: 0, color: "#EF4444" },
  ];

  const gradeDistribution = analytics ? [
    { name: 'Average', value: Number(analytics.academics.averageScore) || 0, color: '#10B981' }
  ] : [
    { name: "A", value: 40, color: "#10B981" },
    { name: "B", value: 35, color: "#6366F1" },
    { name: "C", value: 25, color: "#F59E0B" },
  ];

  useEffect(() => {
    let mounted = true;
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/api/analytics');
        if (!mounted) return;
        setAnalytics(res.data.data);
      } catch (e) {
        // ignore - keep defaults
        console.error('Failed to fetch analytics', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAnalytics();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="flex min-h-screen">
      <StudentSidebar />
      
      <div className="flex-1">
        <DashboardHeader />
        
        <main className="p-8 space-y-8">
          <div className="glass-card rounded-3xl p-8 bg-gradient-to-r from-blue-500/10 to-blue-600/10">
            <h1 className="text-4xl font-bold text-blue-800 mb-4">
              Student Dashboard
            </h1>
            <p className="text-lg text-blue-600 mb-4">
              Track your academic progress and assignments
            </p>
            <Button 
              onClick={() => navigate('/student-dashboard-new')}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              🚀 Try New Enhanced Dashboard
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Students"
              value={loading ? '…' : analytics?.attendance?.totalStudents ?? '—'}
              icon={Users}
              color="hsl(142 100% 75%)"
            />
            <MetricCard
              title="Total Teachers"
              value={loading ? '…' : analytics?.attendance?.totalTeachers ?? '—'}
              icon={BookOpen}
              color="hsl(210 100% 75%)"
            />
            <MetricCard
              title="Average Score"
              value={loading ? '…' : analytics?.academics?.averageScore ?? '—'}
              icon={FileText}
              color="hsl(15 100% 75%)"
            />
            <MetricCard
              title="Attendance Rate"
              value={loading ? '…' : `${analytics?.attendance?.studentAttendanceRate ?? '—'}%`}
              icon={Target}
              color="hsl(142 100% 75%)"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AttendanceChart
              title="My Attendance"
              data={attendanceData}
              size="lg"
            />
            <AttendanceChart
              title="Grade Distribution"
              data={gradeDistribution}
              size="lg"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Upcoming Assignments</h3>
              <div className="space-y-4">
                {[
                  { subject: "Mathematics", title: "Calculus Problem Set", due: "Tomorrow", priority: "high" },
                  { subject: "Physics", title: "Lab Report", due: "3 days", priority: "medium" },
                  { subject: "English", title: "Essay on Literature", due: "1 week", priority: "low" },
                ].map((assignment, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                    <div className={`w-3 h-3 rounded-full ${
                      assignment.priority === 'high' ? 'bg-red-500' :
                      assignment.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{assignment.title}</p>
                      <p className="text-xs text-muted-foreground">{assignment.subject} • Due in {assignment.due}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Today's Classes</h3>
              <div className="space-y-4">
                {[
                  { time: "09:00 AM", subject: "Mathematics", room: "Room 101", teacher: "Dr. Sarah Johnson" },
                  { time: "11:00 AM", subject: "Physics", room: "Lab 1", teacher: "Prof. Michael Chen" },
                  { time: "02:00 PM", subject: "English", room: "Room 205", teacher: "Ms. Jennifer Wilson" },
                ].map((class_, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
                    <div className="w-16 text-sm font-medium text-blue-600">{class_.time}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{class_.subject}</p>
                      <p className="text-xs text-muted-foreground">{class_.room} • {class_.teacher}</p>
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

export default StudentDashboard;