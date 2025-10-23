import { BookOpen, Calendar, FileText, Trophy, Clock, Target, Users } from "lucide-react";
import StudentSidebar from "@/components/StudentSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricCard } from "@/components/MetricCard";
import { AttendanceChart } from "@/components/AttendanceChart";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { studentAPI, timetableAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const StudentDashboard = () => {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

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
      // Only attempt analytics if the authenticated user is STAFF (ADMIN or TEACHER)
      if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
        setLoading(false);
        return;
      }
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

  // Fetch student-specific data: assignments and today's timetable
  const [assignments, setAssignments] = useState<any[]>([]);
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [studentLoading, setStudentLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchStudentData = async () => {
      setStudentLoading(true);
      try {
        const meRes = await studentAPI.getCurrentStudent();
        const student = meRes.data.student;
        if (!mounted) return;

        // assignments for this student
        try {
          const aRes = await studentAPI.getStudentAssignments(student.id);
          if (mounted) setAssignments(aRes.data.data || aRes.data || []);
        } catch (e) {
          console.error('Failed to fetch student assignments', e);
          if (mounted) setAssignments([]);
        }

        // timetables filtered by student's class and today's day name
        try {
          const tRes = await timetableAPI.getTimetables();
          const all = tRes.data.data || tRes.data || [];
          const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
          const todayName = dayNames[new Date().getDay()];
          const classId = student.classId || student.class?.id;
          const filtered = all.filter((slot: any) => {
            if (!classId) return slot.day === todayName;
            return slot.day === todayName && Number(slot.classId) === Number(classId);
          });
          if (mounted) setTodayClasses(filtered);
        } catch (e) {
          console.error('Failed to fetch timetables', e);
          if (mounted) setTodayClasses([]);
        }

      } catch (e) {
        console.error('Failed to fetch current student', e);
      } finally {
        if (mounted) setStudentLoading(false);
      }
    };
    fetchStudentData();
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
                {studentLoading ? (
                  <div>Loading assignments...</div>
                ) : assignments.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No upcoming assignments</div>
                ) : (
                  assignments.map((assignment: any) => (
                    <div key={assignment.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                      <div className={`w-3 h-3 rounded-full ${assignment.priority === 'high' ? 'bg-red-500' : assignment.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{assignment.title || assignment.data?.title || 'Untitled'}</p>
                        <p className="text-xs text-muted-foreground">{assignment.teacherClassSubject?.subject?.name || assignment.subject || ''} • Due {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '—'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Today's Classes</h3>
              <div className="space-y-4">
                {studentLoading ? (
                  <div>Loading classes...</div>
                ) : todayClasses.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No classes scheduled for today</div>
                ) : (
                  todayClasses.map((slot: any) => (
                    <div key={slot.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
                      <div className="w-16 text-sm font-medium text-blue-600">{slot.startMinute && slot.endMinute ? `${Math.floor(slot.startMinute/60).toString().padStart(2,'0')}:${(slot.startMinute%60).toString().padStart(2,'0')} - ${Math.floor(slot.endMinute/60).toString().padStart(2,'0')}:${(slot.endMinute%60).toString().padStart(2,'0')}` : slot.time || '—'}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{slot.subject?.name || slot.subject || slot.subjectName || 'Untitled'}</p>
                        <p className="text-xs text-muted-foreground">{slot.class?.name || `Class ${slot.classId}`} • {slot.teacher?.user?.name || slot.teacherName || 'TBA'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;