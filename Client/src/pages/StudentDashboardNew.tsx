import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Calendar, 
  FileText, 
  Trophy, 
  Clock, 
  Target, 
  Users,
  Bell,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Star,
  ChevronRight,
  Play,
  Download
} from "lucide-react";
import StudentSidebar from "@/components/StudentSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api, { studentAPI, timetableAPI, notificationAPI } from '@/lib/api';

const StudentDashboardNew = () => {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

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

  const [upcomingAssignments, setUpcomingAssignments] = useState<any[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [recentGrades, setRecentGrades] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Fetch student-specific info
  useEffect(() => {
    let mounted = true;
    const fetchStudentData = async () => {
      try {
        const meRes = await studentAPI.getCurrentStudent();
        const student = meRes.data.student;

        // Assignments
        try {
          const aRes = await studentAPI.getStudentAssignments(student.id);
          if (mounted) setUpcomingAssignments(aRes.data.data || aRes.data || []);
        } catch (e) {
          console.error('Failed to fetch student assignments', e);
          if (mounted) setUpcomingAssignments([]);
        }

        // Timetable -> today
        try {
          const tRes = await timetableAPI.getTimetables();
          const all = tRes.data.data || tRes.data || [];
          const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
          const todayName = dayNames[new Date().getDay()];
          const classId = student.classId || student.class?.id;
          const filtered = all.filter((slot: any) => slot.day === todayName && (!classId || Number(slot.classId) === Number(classId)));
          if (mounted) setTodaySchedule(filtered);
        } catch (e) {
          console.error('Failed to fetch timetables', e);
          if (mounted) setTodaySchedule([]);
        }

        // Notifications
        try {
          const nRes = await notificationAPI.getNotifications();
          if (mounted) setNotifications(nRes.data.data || nRes.data || []);
        } catch (e) {
          console.error('Failed to fetch notifications', e);
          if (mounted) setNotifications([]);
        }

        // Recent grades (if you have an endpoint, fallback to analytics)
        try {
          const analyticsRes = await api.get('/api/analytics');
          if (mounted) setRecentGrades(analyticsRes.data.data?.topStudents || []);
        } catch (e) {
          console.error('Failed to fetch analytics for grades', e);
          if (mounted) setRecentGrades([]);
        }

      } catch (e) {
        console.error('Failed to fetch current student', e);
      }
    };
    fetchStudentData();
    return () => { mounted = false; };
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-50';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-50';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <StudentSidebar />
      
      <div className="flex-1">
        <DashboardHeader />
        
        <main className="p-6 space-y-6">
          {/* Welcome Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-8 text-white">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2">Welcome back, Alex!</h1>
                  <p className="text-blue-100 text-lg mb-4">
                    Ready to continue your learning journey?
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>3 assignments completed this week</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>GPA improved by 0.2</span>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                    <Trophy className="w-16 h-16 text-yellow-300" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 font-medium">Current GPA</p>
                    <p className="text-3xl font-bold text-blue-800">3.85</p>
                    <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +0.2 this semester
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 font-medium">Attendance</p>
                    <p className="text-3xl font-bold text-green-800">94%</p>
                    <p className="text-sm text-green-600">Excellent record</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 font-medium">Assignments</p>
                    <p className="text-3xl font-bold text-purple-800">12/15</p>
                    <p className="text-sm text-purple-600">3 pending</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 font-medium">Next Class</p>
                    <p className="text-2xl font-bold text-orange-800">Mathematics</p>
                    <p className="text-sm text-orange-600">in 45 minutes</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Schedule */}
            <Card className="lg:col-span-2 border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Today's Schedule
                </CardTitle>
                <CardDescription>Your classes and activities for today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {todaySchedule.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">No classes scheduled for today.</div>
                ) : (
                  todaySchedule.map((slot, index) => (
                    <div key={slot.id || index} className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                      slot.isCurrent ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                    }`}>
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${slot.isCurrent ? 'bg-blue-500' : 'bg-gray-300'}`} />
                        <div className="w-px h-8 bg-gray-200 mt-2" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{slot.subject?.name || slot.subjectName || 'Untitled'}</p>
                            <p className="text-sm text-gray-600">{slot.teacher?.user?.name || slot.teacherName || 'TBA'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-blue-600">{slot.startMinute && slot.endMinute ? `${Math.floor(slot.startMinute/60).toString().padStart(2,'0')}:${(slot.startMinute%60).toString().padStart(2,'0')}` : slot.time || ''} - {slot.endMinute ? `${Math.floor(slot.endMinute/60).toString().padStart(2,'0')}:${(slot.endMinute%60).toString().padStart(2,'0')}` : ''}</p>
                            <p className="text-sm text-gray-500">{slot.classroom?.name || slot.room || ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">{slot.type || 'Class'}</Badge>
                          {slot.isCurrent && (
                            <Badge className="text-xs bg-blue-500"><Play className="w-3 h-3 mr-1" />In Progress</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-600" />
                  Notifications
                </CardTitle>
                <CardDescription>Recent updates and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">No notifications</div>
                ) : notifications.map((notification) => (
                  <div key={notification.id} className={`p-3 rounded-lg transition-all cursor-pointer ${
                    notification.unread ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.unread ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" className="w-full text-sm">
                  View All Notifications
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assignments */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Upcoming Assignments
                </CardTitle>
                <CardDescription>Track your pending work</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingAssignments.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">No upcoming assignments</div>
                ) : upcomingAssignments.map((assignment: any) => (
                  <div key={assignment.id} className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(assignment.priority)}`} />
                        <div>
                          <p className="font-medium text-gray-900">{assignment.title}</p>
                          <p className="text-sm text-gray-600">{assignment.subject} • Due in {assignment.due}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {assignment.type}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{assignment.progress}%</span>
                      </div>
                      <Progress value={assignment.progress} className="h-2" />
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View All Assignments
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            {/* Recent Grades */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Recent Grades
                </CardTitle>
                <CardDescription>Your latest academic performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentGrades.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">No recent grades available</div>
                ) : recentGrades.map((grade, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{grade.subject}</p>
                        <p className="text-sm text-gray-600">{grade.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getGradeColor(grade.grade)} border-0`}>
                        {grade.grade}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">{grade.score}/100</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View Grade Report
                  <Download className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>Frequently used features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { title: "Submit Assignment", icon: FileText, color: "bg-blue-500" },
                  { title: "View Timetable", icon: Calendar, color: "bg-green-500" },
                  { title: "Check Grades", icon: Trophy, color: "bg-yellow-500" },
                  { title: "Library Access", icon: BookOpen, color: "bg-purple-500" },
                ].map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-20 flex-col gap-2 hover:shadow-md transition-all"
                  >
                    <div className={`w-8 h-8 rounded-full ${action.color} flex items-center justify-center`}>
                      <action.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium">{action.title}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboardNew;