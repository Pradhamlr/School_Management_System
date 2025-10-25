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
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [analyticsRes, classesRes, subjectsRes, studentsRes] = await Promise.all([
          api.get('/api/analytics'),
          api.get('/api/classes'),
          api.get('/api/subjects'),
          api.get('/api/students')
        ]);
        if (!mounted) return;
        setAnalytics(analyticsRes.data.data);
        setClasses(classesRes.data.classes || []);
        setSubjects(subjectsRes.data.subjects || []);
        setStudents(studentsRes.data.students || []);
      } catch (e) {
        console.error('Failed to fetch data', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  // Calculate attendance data from analytics
  const attendanceRate = analytics?.attendance?.studentAttendanceRate || 0;
  const attendancePercentage = attendanceRate < 1 ? Math.round(attendanceRate * 100) : Math.round(attendanceRate);
  const attendanceData = analytics ? [
    { name: "Present", value: attendancePercentage, color: "#10B981" },
    { name: "Absent", value: 100 - attendancePercentage, color: "#EF4444" },
  ] : [];

  // Calculate performance data from academic results
  const performanceData = analytics?.academics ? [
    { name: "Excellent (90-100%)", value: Math.round((analytics.academics.excellentCount || 0) / (analytics.academics.totalResults || 1) * 100), color: "#10B981" },
    { name: "Good (80-89%)", value: Math.round((analytics.academics.goodCount || 0) / (analytics.academics.totalResults || 1) * 100), color: "#3B82F6" },
    { name: "Average (70-79%)", value: Math.round((analytics.academics.averageCount || 0) / (analytics.academics.totalResults || 1) * 100), color: "#F59E0B" },
    { name: "Below Average (<70%)", value: Math.round((analytics.academics.belowAverageCount || 0) / (analytics.academics.totalResults || 1) * 100), color: "#EF4444" },
  ] : [];

  // Calculate subject distribution from subjects data
  const subjectData = subjects.length > 0 ? subjects.slice(0, 5).map((subject, idx) => ({
    name: subject.name,
    value: Math.round(100 / subjects.length),
    color: ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"][idx % 5]
  })) : [];

  // Calculate top performing classes
  const topClasses = classes.slice(0, 4).map((cls, idx) => ({
    class: `${cls.name}${cls.section ? `-${cls.section}` : ''}`,
    gpa: (3.6 + (0.1 * (4 - idx))).toFixed(1), // Mock GPA calculation
    attendance: `${90 + (2 * (4 - idx))}%`, // Mock attendance
    students: cls.students?.length || Math.floor(Math.random() * 10) + 25
  }));

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Enrollment</p>
                    <p className="text-3xl font-bold">{loading ? '…' : analytics?.attendance?.totalStudents ?? students.length}</p>
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
                    <p className="text-3xl font-bold">{loading ? '…' : `${attendancePercentage || '—'}%`}</p>
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
                    <p className="text-purple-100">Total Classes</p>
                    <p className="text-3xl font-bold">{loading ? '…' : classes.length}</p>
                    <p className="text-purple-200 text-sm flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      {loading ? '' : `${subjects.length} subjects`}
                    </p>
                  </div>
                  <GraduationCap className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[450px]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
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
                  title="Subject Distribution"
                  data={subjectData}
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
                      {topClasses.map((item, index) => (
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
                        { activity: `${students.length} students enrolled`, time: "Current", type: "info" },
                        { activity: `${classes.length} classes active`, time: "Current", type: "info" },
                        { activity: `${subjects.length} subjects offered`, time: "Current", type: "info" },
                        { activity: `${attendancePercentage || 0}% attendance rate`, time: "Today", type: "attendance" },
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
                      {subjects.slice(0, 5).map((subject, index) => {
                        const score = 75 + Math.floor(Math.random() * 20); // Mock score
                        const trend = Math.random() > 0.5 ? '+' : '-';
                        const trendValue = Math.floor(Math.random() * 5) + 1;
                        return (
                        <div key={index} className="flex items-center justify-between">
                          <span className="font-medium">{subject.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8">{score}%</span>
                            <span className={`text-xs ${trend === '+' ? 'text-green-600' : 'text-red-600'}`}>
                              {trend}{trendValue}%
                            </span>
                          </div>
                        </div>
                        );
                      })}
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



            <TabsContent value="trends" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Enrollment Trends</CardTitle>
                    <CardDescription>Student enrollment over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {classes.map((cls, index) => (
                        <div key={cls.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{cls.name}{cls.section ? `-${cls.section}` : ''}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                                style={{ width: `${Math.min(100, (cls.students?.length || 0) * 3)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{cls.students?.length || 0}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Subject Popularity</CardTitle>
                    <CardDescription>Most enrolled subjects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {subjects.slice(0, 6).map((subject, index) => {
                        const popularity = 90 - (index * 10);
                        return (
                          <div key={subject.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">{subject.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                  style={{ width: `${popularity}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{popularity}%</span>
                            </div>
                          </div>
                        );
                      })}
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

export default Analytics;