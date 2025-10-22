import { Users, BookOpen, Calendar, CheckSquare, FileText, Clock } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricCard } from "@/components/MetricCard";
import { AttendanceChart } from "@/components/AttendanceChart";
import { useEffect, useState } from 'react';
import api from '@/lib/api';

const TeacherDashboard = () => {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const classAttendanceData = analytics ? [
    { name: 'Present', value: Number(analytics.attendance.studentAttendanceRate) || 0, color: '#10B981' },
    { name: 'Absent', value: 100 - (Number(analytics.attendance.studentAttendanceRate) || 0), color: '#EF4444' },
  ] : [
    { name: "Present", value: 0, color: "#10B981" },
    { name: "Absent", value: 0, color: "#EF4444" },
  ];

  const assignmentStatusData = [
    { name: "Submitted", value: 70, color: "#6366F1" },
    { name: "Pending", value: 30, color: "#F59E0B" },
  ];

  useEffect(() => {
    let mounted = true;
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/api/analytics');
        if (!mounted) return;
        setAnalytics(res.data.data);
      } catch (e) {
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
              title="Avg. Attendance"
              value={loading ? '…' : `${analytics?.attendance?.studentAttendanceRate ?? '—'}%`}
              icon={FileText}
              color="hsl(45 100% 75%)"
            />
            <MetricCard
              title="Classes"
              value={loading ? '…' : analytics?.attendance?.totalClasses ?? '—'}
              icon={Clock}
              color="hsl(330 100% 75%)"
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