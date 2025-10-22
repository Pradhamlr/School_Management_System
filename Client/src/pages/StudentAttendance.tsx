import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, User } from 'lucide-react';
import StudentSidebar from '@/components/StudentSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { attendanceAPI, studentAPI } from '@/lib/api';

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        // Get current student
        const studentResponse = await studentAPI.getCurrentStudent();
        const studentId = studentResponse.data.student.id;

        // Get attendance data
        const attendanceResponse = await attendanceAPI.getStudentAttendance(studentId);
        setAttendance(attendanceResponse.data.data?.attendance || []);
        setStats(attendanceResponse.data.data?.statistics || null);

        // Get overall stats
        const statsResponse = await attendanceAPI.getAttendanceStats();
        if (!stats) {
          setStats(statsResponse.data.data?.summary || {});
        }
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800 border-green-200';
      case 'ABSENT': return 'bg-red-100 text-red-800 border-red-200';
      case 'LATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'EXCUSED': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT': return CheckCircle;
      case 'ABSENT': return XCircle;
      case 'LATE': return Clock;
      case 'EXCUSED': return AlertCircle;
      default: return User;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <StudentSidebar />
        <div className="flex-1">
          <DashboardHeader />
          <main className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <StudentSidebar />
      
      <div className="flex-1">
        <DashboardHeader />
        
        <main className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
              <p className="text-gray-600 mt-1">Track your attendance record and statistics</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 font-medium">Present Days</p>
                    <p className="text-3xl font-bold text-green-800">{stats?.present || 0}</p>
                    <p className="text-sm text-green-600">This month</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 font-medium">Absent Days</p>
                    <p className="text-3xl font-bold text-red-800">{stats?.absent || 0}</p>
                    <p className="text-sm text-red-600">This month</p>
                  </div>
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-600 font-medium">Late Days</p>
                    <p className="text-3xl font-bold text-yellow-800">{stats?.late || 0}</p>
                    <p className="text-sm text-yellow-600">This month</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 font-medium">Attendance Rate</p>
                    <p className="text-3xl font-bold text-blue-800">{stats?.attendanceRate || 0}%</p>
                    <p className="text-sm text-blue-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Good record
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Progress */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Attendance Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Overall Attendance</span>
                  <span className="font-medium">{stats?.attendanceRate || 0}%</span>
                </div>
                <Progress value={stats?.attendanceRate || 0} className="h-3" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-medium text-green-600">{stats?.present || 0}</p>
                    <p className="text-gray-500">Present</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-red-600">{stats?.absent || 0}</p>
                    <p className="text-gray-500">Absent</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-yellow-600">{stats?.late || 0}</p>
                    <p className="text-gray-500">Late</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-blue-600">{stats?.excused || 0}</p>
                    <p className="text-gray-500">Excused</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Records */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Recent Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attendance.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records</h3>
                  <p className="text-gray-600">Your attendance records will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {attendance.map((record: any, index) => {
                    const StatusIcon = getStatusIcon(record.status);
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(record.status).replace('text-', 'bg-').replace('bg-', 'bg-').replace('-800', '-500').replace('-100', '-100')}`}>
                            <StatusIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {new Date(record.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                            {record.remarks && (
                              <p className="text-sm text-gray-600">{record.remarks}</p>
                            )}
                          </div>
                        </div>
                        
                        <Badge className={`${getStatusColor(record.status)} border`}>
                          {record.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default StudentAttendance;