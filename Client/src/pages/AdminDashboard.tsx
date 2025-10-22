import { useState, useEffect } from "react";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Settings, 
  BarChart3, 
  TrendingUp,
  UserPlus,
  Bell,
  DollarSign,
  Award,
  Clock,
  Activity
} from "lucide-react";
import api from '@/lib/api';
import AdminSidebar from "@/components/AdminSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricCard } from "@/components/MetricCard";
import { AttendanceChart } from "@/components/AttendanceChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
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

  const studentAttendanceData = [
    { name: "Present", value: 78, color: "#10B981" },
    { name: "Absent", value: 22, color: "#EF4444" },
  ];

  const teacherAttendanceData = [
    { name: "Present", value: 92, color: "#6366F1" },
    { name: "Absent", value: 8, color: "#EF4444" },
  ];

  const performanceData = [
    { name: "Excellent", value: 45, color: "#10B981" },
    { name: "Good", value: 35, color: "#F59E0B" },
    { name: "Average", value: 20, color: "#EF4444" },
  ];

  const recentActivities = [
    { type: "student", message: "New student Alex Thompson enrolled", time: "2 hours ago", icon: UserPlus },
    { type: "payment", message: "Fee payment of $2,500 received", time: "4 hours ago", icon: DollarSign },
    { type: "exam", message: "Mathematics exam results published", time: "6 hours ago", icon: Award },
    { type: "teacher", message: "Dr. Sarah Johnson updated profile", time: "8 hours ago", icon: Users },
  ];

  const quickActions = [
    { title: "Add Student", description: "Enroll new student", icon: UserPlus, color: "bg-blue-500" },
    { title: "Add Teacher", description: "Hire new teacher", icon: GraduationCap, color: "bg-green-500" },
    { title: "Create Class", description: "Setup new class", icon: BookOpen, color: "bg-purple-500" },
    { title: "Schedule Event", description: "Plan school event", icon: Calendar, color: "bg-orange-500" },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />
      
      <div className="flex-1">
        <DashboardHeader />
        
        <main className="p-8 space-y-8">
          {/* Welcome Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 p-8 text-white">
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-2">Welcome back, Administrator</h1>
              <p className="text-purple-100 text-lg">
                Manage your school with powerful insights and controls
              </p>
              <div className="flex gap-4 mt-6">
                <Button className="bg-white text-purple-700 hover:bg-purple-50">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-purple-700">
                  <Settings className="w-4 h-4 mr-2" />
                  System Settings
                </Button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 translate-x-16"></div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Students"
              value={loading ? '…' : analytics?.attendance?.totalStudents ?? '—'}
              icon={Users}
              color="hsl(217 91% 60%)"
            />
            <MetricCard
              title="Total Teachers"
              value={loading ? '…' : analytics?.attendance?.totalTeachers ?? '—'}
              icon={GraduationCap}
              color="hsl(142 76% 36%)"
            />
            <MetricCard
              title="Active Classes"
              value={loading ? '…' : analytics?.attendance?.totalClasses ?? '—'}
              icon={BookOpen}
              color="hsl(262 83% 58%)"
            />
            <MetricCard
              title="Monthly Revenue"
              value="$125K"
              icon={DollarSign}
              color="hsl(25 95% 53%)"
            />
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="management">Management</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <AttendanceChart
                  title="Student Attendance"
                  data={studentAttendanceData}
                  size="lg"
                />
                <AttendanceChart
                  title="Teacher Attendance"
                  data={teacherAttendanceData}
                  size="lg"
                />
                <AttendanceChart
                  title="Academic Performance"
                  data={performanceData}
                  size="lg"
                />
              </div>

              {/* Quick Actions & Recent Activities */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-600" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>Frequently used administrative tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {quickActions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="h-20 flex-col gap-2 hover:shadow-md transition-all"
                        >
                          <div className={`w-8 h-8 rounded-full ${action.color} flex items-center justify-center`}>
                            <action.icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-sm">{action.title}</div>
                            <div className="text-xs text-muted-foreground">{action.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Recent Activities
                    </CardTitle>
                    <CardDescription>Latest system activities and updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivities.map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                            <activity.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.message}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Performance Trends</CardTitle>
                    <CardDescription>Academic performance over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <TrendingUp className="w-16 h-16 mb-4" />
                      <p>Performance analytics will be displayed here</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Financial Overview</CardTitle>
                    <CardDescription>Revenue and expense tracking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <DollarSign className="w-16 h-16 mb-4" />
                      <p>Financial charts will be displayed here</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="management" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur hover:shadow-xl transition-shadow cursor-pointer">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle>Student Management</CardTitle>
                    <CardDescription>Add, edit, and manage student records</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur hover:shadow-xl transition-shadow cursor-pointer">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <GraduationCap className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle>Teacher Management</CardTitle>
                    <CardDescription>Manage faculty and staff members</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur hover:shadow-xl transition-shadow cursor-pointer">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <BookOpen className="w-8 h-8 text-purple-600" />
                    </div>
                    <CardTitle>Class Management</CardTitle>
                    <CardDescription>Organize classes and subjects</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Generate Reports</CardTitle>
                    <CardDescription>Create comprehensive school reports</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full justify-start" variant="outline">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Attendance Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Award className="w-4 h-4 mr-2" />
                      Academic Performance Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Financial Report
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Users className="w-4 h-4 mr-2" />
                      Student Demographics Report
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                    <CardDescription>Monitor system performance and status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Database Status</span>
                        <span className="text-green-600 text-sm">Healthy</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Server Uptime</span>
                        <span className="text-green-600 text-sm">99.9%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Active Users</span>
                        <span className="text-blue-600 text-sm">1,247</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Storage Used</span>
                        <span className="text-orange-600 text-sm">67%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;