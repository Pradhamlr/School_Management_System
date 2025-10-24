import { useState, useEffect } from "react";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  CheckSquare, 
  FileText, 
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  UserPlus
} from "lucide-react";
import { TeacherSidebar } from "@/components/TeacherSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from '@/lib/api';

const TeacherClasses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [teacherAnalytics, setTeacherAnalytics] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        const res = await api.get('/api/classes/me/teacher');
        if (!mounted) return;
        setClasses(res.data.classes || []);
      } catch (e: any) {
        console.error('Error fetching teacher classes', e?.response?.status, e?.response?.data || e.message);
        setClasses([]);
      } finally {
        if (mounted) setLoadingClasses(false);
      }
    };
    fetchClasses();
    // fetch teacher analytics for consistent counts
    const fetchTeacherAnalytics = async () => {
      try {
        const res = await api.get('/api/analytics/teacher');
        setTeacherAnalytics(res.data.data || null);
      } catch (e: any) {
        console.error('Failed to fetch teacher analytics', e?.response?.status, e?.response?.data || e.message);
      }
    };
    fetchTeacherAnalytics();
    return () => { mounted = false; };
  }, []);

  const filteredClasses = classes.filter(cls => {
    const name = (cls.name || `${cls.name ?? ''} ${cls.section ?? ''}`).toString().toLowerCase();
    const subject = (cls.subject || (cls.timetable && cls.timetable[0]?.subject?.name) || '').toString().toLowerCase();
    const term = searchTerm.toLowerCase();
    return name.includes(term) || subject.includes(term);
  });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TeacherSidebar />
      
      <div className="flex-1">
        <DashboardHeader />
        
        <main className="p-8 space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Classes</h1>
              <p className="text-muted-foreground mt-1">Manage your classes and students</p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Class
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Classes ({classes.length})</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {/* Classes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClasses.map((classItem) => (
                  <Card key={classItem.id} className="shadow-lg border-0 bg-white/80 backdrop-blur hover:shadow-xl transition-all duration-200 group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{classItem.name || `${classItem.name ?? ''} ${classItem.section ?? ''}`}</CardTitle>
                            <CardDescription>{Array.isArray(classItem.students) ? classItem.students.length : (typeof classItem.students === 'number' ? classItem.students : (classItem.studentsCount ?? 0))} students</CardDescription>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Class
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Add Students
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Room</p>
                          <p className="font-medium">{classItem.room || (classItem.timetable && classItem.timetable[0]?.classroom?.name) || '—'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Schedule</p>
                          <p className="font-medium text-xs">{classItem.schedule || (classItem.timetable && classItem.timetable.map((t:any) => `${t.day} ${Math.floor(t.startMinute/60)}:${String(t.startMinute%60).padStart(2,'0')}`).join(', ')) || '—'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-lg font-bold text-green-600">{
                              typeof classItem.attendance === 'number'
                                ? `${classItem.attendance}%`
                                : (typeof classItem.attendanceRate === 'number' ? `${classItem.attendanceRate}%` : '—')
                            }</p>
                            <p className="text-xs text-muted-foreground">Attendance</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-blue-600">{Array.isArray(classItem.assignments) ? classItem.assignments.length : (typeof classItem.assignments === 'number' ? classItem.assignments : (classItem.assignmentCount ?? 0))}</p>
                            <p className="text-xs text-muted-foreground">Assignments</p>
                          </div>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {classItem.status}
                        </Badge>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <CheckSquare className="w-4 h-4 mr-2" />
                          Attendance
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <FileText className="w-4 h-4 mr-2" />
                          Assignments
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="active">
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Active Classes</h3>
                <p className="text-muted-foreground">All your classes are currently active</p>
              </div>
            </TabsContent>

            <TabsContent value="archived">
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Archived Classes</h3>
                <p className="text-muted-foreground">You don't have any archived classes yet</p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{teacherAnalytics ? teacherAnalytics.data?.assignmentsCount ?? teacherAnalytics.assignmentsCount ?? '…' : '…'}</p>
                    <p className="text-sm text-muted-foreground">Assignments</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{teacherAnalytics ? teacherAnalytics.data?.activeClasses ?? teacherAnalytics.activeClasses ?? '…' : '…'}</p>
                    <p className="text-sm text-muted-foreground">Active Classes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherClasses;