import { 
  Users, 
  BookOpen, 
  Calendar, 
  CheckSquare, 
  FileText, 
  Clock, 
  Award,
  TrendingUp,
  Bell,
  Plus,
  Eye
} from "lucide-react";
import { TeacherSidebar } from "@/components/TeacherSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricCard } from "@/components/MetricCard";
import { AttendanceChart } from "@/components/AttendanceChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from 'react';
import api from '@/lib/api';

const TeacherDashboard = () => {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  const classAttendanceData = analytics ? [
    // analytics may be the simplified teacher analytics { activeClasses, assignmentsCount }
    // guard access to attendance fields which may be missing
    { name: 'Present', value: Number(analytics?.attendance?.studentAttendanceRate ?? analytics?.data?.attendance?.studentAttendanceRate ?? 0) || 0, color: '#10B981' },
    { name: 'Absent', value: 100 - (Number(analytics?.attendance?.studentAttendanceRate ?? analytics?.data?.attendance?.studentAttendanceRate ?? 0) || 0), color: '#EF4444' },
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
        // use teacher-specific analytics to keep dashboard numbers consistent
        const res = await api.get('/api/analytics/teacher');
        if (!mounted) return;
        // res.data.data may be the simplified teacher analytics or the full analytics depending on backend
        setAnalytics(res.data.data || res.data);
      } catch (e) {
        console.error('Failed to fetch analytics', e?.response?.status, e?.response?.data || e?.message || e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAnalytics();
    // fetch classes assigned to this teacher
    const fetchMyClasses = async () => {
      try {
        const res = await api.get('/api/classes/me/teacher');
        setMyClasses(res.data.classes || []);
      } catch (e) {
        console.error('Failed to fetch teacher classes', e?.response?.status, e?.response?.data || e?.message || e);
      }
    };
    fetchMyClasses();
    return () => { mounted = false; };
  }, []);

  const upcomingAssignments = [
    { title: "Math Quiz - Chapter 5", class: "10-A", dueDate: "Tomorrow", submissions: 15, total: 25, status: "active" },
    { title: "Physics Lab Report", class: "11-B", dueDate: "Dec 28", submissions: 8, total: 20, status: "pending" },
    { title: "Chemistry Assignment", class: "12-A", dueDate: "Dec 30", submissions: 22, total: 28, status: "active" },
  ];

  const recentActivities = [
    { type: "submission", message: "John Doe submitted Math Quiz", time: "5 min ago", class: "10-A" },
    { type: "grade", message: "Graded Physics Lab Report for 11-B", time: "1 hour ago", class: "11-B" },
    { type: "attendance", message: "Marked attendance for Chemistry class", time: "2 hours ago", class: "12-A" },
    { type: "announcement", message: "Posted announcement about exam schedule", time: "3 hours ago", class: "All" },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TeacherSidebar />
      
      <div className="flex-1">
        <DashboardHeader />
        
        <main className="p-8 space-y-8">
          {/* Welcome Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-500 via-emerald-600 to-teal-700 p-8 text-white">
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-2">Welcome back, Teacher</h1>
              <p className="text-green-100 text-lg">
                Inspire minds and shape the future with your teaching
              </p>
              <div className="flex gap-4 mt-6">
                <Button className="bg-white text-green-700 hover:bg-green-50">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Assignment
                </Button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 translate-x-16"></div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Active Classes"
              value={loading ? '…' : analytics?.activeClasses ?? '…'}
              icon={BookOpen}
              color="hsl(217 91% 60%)"
            />
            <MetricCard
              title="Assignments"
              value={loading ? '…' : analytics?.assignmentsCount ?? '…'}
              icon={FileText}
              color="hsl(262 83% 58%)"
            />
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="classes">My Classes</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Charts Section */}
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

              {/* Recent Activities & Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-green-600" />
                      Recent Activities
                    </CardTitle>
                    <CardDescription>Latest updates from your classes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivities.map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.message}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-muted-foreground">{activity.time}</p>
                              <Badge variant="secondary" className="text-xs">{activity.class}</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Performance Overview
                    </CardTitle>
                    <CardDescription>Your teaching metrics this month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Average Grade</span>
                        <span className="text-green-600 text-sm font-bold">B+</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Assignment Completion</span>
                        <span className="text-blue-600 text-sm font-bold">87%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Class Participation</span>
                        <span className="text-purple-600 text-sm font-bold">92%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Parent Satisfaction</span>
                        <span className="text-orange-600 text-sm font-bold">4.8/5</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="assignments" className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      Upcoming Assignments
                    </span>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      New Assignment
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingAssignments.map((assignment, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{assignment.title}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <Badge variant="outline">{assignment.class}</Badge>
                            <span className="text-sm text-muted-foreground">Due: {assignment.dueDate}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{assignment.submissions}/{assignment.total} submitted</p>
                          <Badge variant={assignment.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                            {assignment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="classes" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myClasses.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground">No classes assigned yet.</div>
                ) : (
                  myClasses.map((cls: any) => (
                    <Card key={cls.id} className="shadow-lg border-0 bg-white/80 backdrop-blur hover:shadow-xl transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-lg">{`${cls.name} ${cls.section}`}</CardTitle>
                        <CardDescription>{cls.students ? cls.students.length : 0} students</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Class Teacher:</span>
                            <span className="font-medium">{cls.classTeacher?.user?.name || '—'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subjects / Timetable:</span>
                            <span className="font-medium">{cls.timetable ? cls.timetable.length : 0} slots</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    Today's Schedule
                  </CardTitle>
                  <CardDescription>Your classes and activities for today</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { time: "09:00 AM", subject: "Mathematics", class: "10-A", room: "Room 101", type: "class" },
                      { time: "10:30 AM", subject: "Physics", class: "11-A", room: "Lab 1", type: "class" },
                      { time: "11:30 AM", subject: "Break", class: "", room: "", type: "break" },
                      { time: "12:00 PM", subject: "Mathematics", class: "10-B", room: "Room 102", type: "class" },
                      { time: "01:00 PM", subject: "Lunch Break", class: "", room: "", type: "break" },
                      { time: "02:00 PM", subject: "Physics", class: "12-A", room: "Lab 2", type: "class" },
                      { time: "03:00 PM", subject: "Parent Meeting", class: "10-A", room: "Office", type: "meeting" },
                    ].map((schedule, index) => (
                      <div key={index} className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                        schedule.type === 'break' ? 'bg-gray-50' : 
                        schedule.type === 'meeting' ? 'bg-blue-50' : 'bg-green-50'
                      }`}>
                        <div className="w-20 text-sm font-medium text-green-600">{schedule.time}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {schedule.subject} {schedule.class && `- ${schedule.class}`}
                          </p>
                          {schedule.room && <p className="text-xs text-muted-foreground">{schedule.room}</p>}
                        </div>
                        <Badge variant={schedule.type === 'break' ? 'secondary' : schedule.type === 'meeting' ? 'outline' : 'default'}>
                          {schedule.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;