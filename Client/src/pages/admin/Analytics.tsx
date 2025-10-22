import { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  GraduationCap, 
  DollarSign,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceChart } from "@/components/AttendanceChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import api from '@/lib/api';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("month");
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

  const attendanceData = [
    { name: "Present", value: 85, color: "#10B981" },
    { name: "Absent", value: 15, color: "#EF4444" },
  ];

  const performanceData = [
    { name: "Excellent", value: 35, color: "#10B981" },
    { name: "Good", value: 40, color: "#3B82F6" },
    { name: "Average", value: 20, color: "#F59E0B" },
    { name: "Below Average", value: 5, color: "#EF4444" },
  ];

  const departmentData = [
    { name: "Science", value: 30, color: "#8B5CF6" },
    { name: "Mathematics", value: 25, color: "#06B6D4" },
    { name: "English", value: 20, color: "#10B981" },
    { name: "Social Studies", value: 15, color: "#F59E0B" },
    { name: "Arts", value: 10, color: "#EF4444" },
  ];

  const monthlyStats = [
    { month: "Jan", students: 2650, teachers: 145, revenue: 125000 },
    { month: "Feb", students: 2680, teachers: 148, revenue: 128000 },
    { month: "Mar", students: 2720, teachers: 152, revenue: 132000 },
    { month: "Apr", students: 2750, teachers: 155, revenue: 135000 },
    { month: "May", students: 2780, teachers: 156, revenue: 138000 },
    { month: "Jun", students: 2800, teachers: 158, revenue: 140000 },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />
      
      <div className="flex-1">
        <DashboardHeader />
        
        <main className="p-8 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
            </div>
            <div className="flex gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Enrollment</p>
                    <p className="text-3xl font-bold">{loading ? '…' : analytics?.attendance?.totalStudents ?? '—'}</p>
                    <p className="text-blue-200 text-sm flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      {loading ? '' : `Present today: ${analytics?.attendance?.studentsPresentToday ?? '—'}`}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Avg. Attendance</p>
                    <p className="text-3xl font-bold">{loading ? '…' : `${analytics?.attendance?.studentAttendanceRate ?? '—'}%`}</p>
                    <p className="text-green-200 text-sm flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      {loading ? '' : `Teachers present: ${analytics?.attendance?.teachersPresentToday ?? '—'}`}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Academic Score</p>
                    <p className="text-3xl font-bold">{loading ? '…' : analytics?.academics?.averageScore ?? '—'}</p>
                    <p className="text-purple-200 text-sm flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      {loading ? '' : `${analytics?.academics?.totalResults ?? 0} results`}
                    </p>
                  </div>
                  <GraduationCap className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Monthly Revenue</p>
                    <p className="text-3xl font-bold">{loading ? '…' : `$${(analytics?.meta?.monthlyRevenue ?? 0).toLocaleString()}`}</p>
                    <p className="text-orange-200 text-sm flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +8.7% from last month
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <AttendanceChart
                  title="Overall Attendance"
                  data={attendanceData}
                  size="lg"
                />
                <AttendanceChart
                  title="Academic Performance"
                  data={performanceData}
                  size="lg"
                />
                <AttendanceChart
                  title="Department Distribution"
                  data={departmentData}
                  size="lg"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Top Performing Classes</CardTitle>
                    <CardDescription>Based on average GPA and attendance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { class: "12-A", gpa: "3.9", attendance: "96%", students: 32 },
                        { class: "11-B", gpa: "3.8", attendance: "94%", students: 30 },
                        { class: "10-A", gpa: "3.7", attendance: "92%", students: 35 },
                        { class: "12-B", gpa: "3.6", attendance: "90%", students: 28 },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">Class {item.class}</p>
                              <p className="text-sm text-muted-foreground">{item.students} students</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">GPA: {item.gpa}</p>
                            <p className="text-sm text-muted-foreground">Attendance: {item.attendance}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                    <CardDescription>Latest system activities and updates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { activity: "Monthly attendance report generated", time: "2 hours ago", type: "report" },
                        { activity: "New teacher Sarah Johnson added", time: "5 hours ago", type: "user" },
                        { activity: "Class 10-A exam results published", time: "1 day ago", type: "academic" },
                        { activity: "Fee collection completed for March", time: "2 days ago", type: "financial" },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.activity}</p>
                            <p className="text-xs text-muted-foreground">{item.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="academic" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Subject-wise Performance</CardTitle>
                    <CardDescription>Average scores across different subjects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { subject: "Mathematics", score: 87, trend: "+3%" },
                        { subject: "Physics", score: 84, trend: "+1%" },
                        { subject: "Chemistry", score: 82, trend: "-2%" },
                        { subject: "English", score: 89, trend: "+5%" },
                        { subject: "Biology", score: 85, trend: "+2%" },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="font-medium">{item.subject}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                style={{ width: `${item.score}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8">{item.score}%</span>
                            <span className={`text-xs ${item.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                              {item.trend}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Grade Distribution</CardTitle>
                    <CardDescription>Current semester grade breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AttendanceChart
                      title=""
                      data={performanceData}
                      size="lg"
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Revenue Breakdown</CardTitle>
                    <CardDescription>Monthly revenue sources</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { source: "Tuition Fees", amount: "$98,000", percentage: "70%" },
                        { source: "Lab Fees", amount: "$21,000", percentage: "15%" },
                        { source: "Library Fees", amount: "$14,000", percentage: "10%" },
                        { source: "Other Fees", amount: "$7,000", percentage: "5%" },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="font-medium">{item.source}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{item.amount}</span>
                            <span className="text-xs text-muted-foreground">({item.percentage})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Payment Status</CardTitle>
                    <CardDescription>Current payment collection status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Collected</span>
                        <span className="text-green-600 font-bold">$125,000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Pending</span>
                        <span className="text-orange-600 font-bold">$15,000</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Overdue</span>
                        <span className="text-red-600 font-bold">$3,500</span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Total Expected</span>
                          <span className="font-bold">$143,500</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle>Growth Trends</CardTitle>
                  <CardDescription>6-month growth analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                      <p>Trend charts will be displayed here</p>
                    </div>
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

export default Analytics;