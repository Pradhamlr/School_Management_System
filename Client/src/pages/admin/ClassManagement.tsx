import { useState, useEffect } from "react";
import api from '@/lib/api';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  GraduationCap,
  MoreHorizontal,
  UserPlus,
  Settings
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminSidebar from "@/components/AdminSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ClassManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [viewClass, setViewClass] = useState<any>(null);
  const [editClass, setEditClass] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', section: '' });
  const [viewStudents, setViewStudents] = useState<any>(null);
  const [viewSubjects, setViewSubjects] = useState<any>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/api/classes');
      console.log('Classes API response:', response.data); // Debug log
      setClasses(response.data.classes || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/api/teachers');
      setTeachers(response.data.teachers || []);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    }
  };

  const assignTeacher = async (classId: number, teacherId: string) => {
    try {
      await api.post(`/api/classes/${classId}/teacher`, {
        classTeacherId: parseInt(teacherId)
      });
      fetchClasses();
      setSelectedClass(null);
      setSelectedTeacher("");
    } catch (error) {
      console.error('Failed to assign teacher:', error);
    }
  };

  const fetchClassDetails = async (classId: number) => {
    try {
      const response = await api.get(`/api/classes/${classId}`);
      console.log('Class details:', response.data); // Debug log
      setViewClass(response.data.class);
    } catch (error) {
      console.error('Failed to fetch class details:', error);
    }
  };

  const fetchClassForStudents = async (classId: number) => {
    try {
      const response = await api.get(`/api/classes/${classId}`);
      setViewClass(response.data.class);
    } catch (error) {
      console.error('Failed to fetch class details:', error);
    }
  };

  const fetchClassForSubjects = async (classId: number) => {
    try {
      const response = await api.get(`/api/classes/${classId}`);
      setViewClass(response.data.class);
    } catch (error) {
      console.error('Failed to fetch class details:', error);
    }
  };

  const updateClass = async (classId: number, data: any) => {
    try {
      await api.patch(`/api/classes/${classId}`, data);
      fetchClasses();
      setEditClass(null);
      setEditForm({ name: '', section: '' });
    } catch (error) {
      console.error('Failed to update class:', error);
    }
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = `${cls.name}-${cls.section}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (cls.classTeacher?.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'active' && cls.classTeacher) ||
                      (activeTab === 'inactive' && !cls.classTeacher);
    const matchesFilter = filterBy === 'all' ||
                         (filterBy === 'high-capacity' && (cls.students?.length || 0) > 20) ||
                         (filterBy === 'low-capacity' && (cls.students?.length || 0) <= 10) ||
                         (filterBy === 'has-subjects' && cls.timetables && cls.timetables.length > 0) ||
                         (filterBy === 'no-subjects' && (!cls.timetables || cls.timetables.length === 0));
    return matchesSearch && matchesTab && matchesFilter;
  });

  const getSubjectsFromTimetable = (timetables: any[]) => {
    if (!timetables) return [];
    const subjects = new Set();
    timetables.forEach(tt => {
      if (tt.subject?.name) subjects.add(tt.subject.name);
    });
    return Array.from(subjects);
  };

  const getStatusColor = (status: string) => {
    return status === "Active" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : 
           "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
  };

  const getCapacityColor = (students: number, capacity: number) => {
    const percentage = (students / capacity) * 100;
    if (percentage >= 90) return "text-red-600 dark:text-red-400";
    if (percentage >= 75) return "text-orange-600 dark:text-orange-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      <AdminSidebar />
      
      <div className="flex-1">
        <DashboardHeader />
        
        <main className="p-8 space-y-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Class Management</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Organize and manage all classes efficiently</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Button variant="outline" className="gap-2" onClick={() => setShowFilter(!showFilter)}>
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
                {showFilter && (
                  <div className="absolute top-12 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-slate-700/50 rounded-xl shadow-xl p-6 z-20 min-w-64">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Filter className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white">Filter Classes</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="radio" name="filter" value="all" checked={filterBy === 'all'} onChange={(e) => setFilterBy(e.target.value)} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">All Classes</span>
                          </div>
                        </label>
                      </div>
                      <div className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="radio" name="filter" value="high-capacity" checked={filterBy === 'high-capacity'} onChange={(e) => setFilterBy(e.target.value)} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">High Capacity</span>
                            <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">20+ students</Badge>
                          </div>
                        </label>
                      </div>
                      <div className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="radio" name="filter" value="low-capacity" checked={filterBy === 'low-capacity'} onChange={(e) => setFilterBy(e.target.value)} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Low Capacity</span>
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">≤10 students</Badge>
                          </div>
                        </label>
                      </div>
                      <div className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="radio" name="filter" value="has-subjects" checked={filterBy === 'has-subjects'} onChange={(e) => setFilterBy(e.target.value)} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Has Subjects</span>
                          </div>
                        </label>
                      </div>
                      <div className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="radio" name="filter" value="no-subjects" checked={filterBy === 'no-subjects'} onChange={(e) => setFilterBy(e.target.value)} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">No Subjects</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <Plus className="w-4 h-4" />
                Create Class
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Classes</p>
                    <p className="text-3xl font-bold">{loading ? '...' : classes.length}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Active Classes</p>
                    <p className="text-3xl font-bold">{loading ? '...' : classes.filter(c => c.classTeacher).length}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Total Students</p>
                    <p className="text-3xl font-bold">{loading ? '...' : classes.reduce((sum, c) => sum + (c.students?.length || 0), 0)}</p>
                  </div>
                  <UserPlus className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Avg. Capacity</p>
                    <p className="text-3xl font-bold">{loading ? '...' : classes.length > 0 ? Math.round((classes.reduce((sum, c) => sum + (c.students?.length || 0), 0) / (classes.length * 30)) * 100) + '%' : '0%'}</p>
                  </div>
                  <Settings className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Tabs */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search classes by name, teacher, or room..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600"
                  />
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-gray-100 dark:bg-slate-700">
                    <TabsTrigger value="all">All Classes</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {/* Classes Grid */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse bg-white dark:bg-slate-800 shadow-lg">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredClasses.map((cls) => (
              <Card key={cls.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 shadow-lg hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl dark:text-white">Class {cls.name}-{cls.section}</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{cls.room}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => fetchClassDetails(cls.id)}>
                          <Eye className="w-4 h-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2" onClick={() => { setEditClass(cls); setEditForm({ name: cls.name, section: cls.section }); }}>
                          <Edit className="w-4 h-4" />
                          Edit Class
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-red-600">
                          <Trash2 className="w-4 h-4" />
                          Delete Class
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Status and Capacity */}
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(cls.classTeacher ? 'Active' : 'Inactive')}>
                      {cls.classTeacher ? 'Active' : 'Inactive'}
                    </Badge>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getCapacityColor(cls.students?.length || 0, 30)}`}>
                        {Array.isArray(cls.students) ? cls.students.length : 0}/30 Students
                      </p>
                      <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                          style={{ width: `${((cls.students?.length || 0) / 30) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Class Teacher */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    {cls.classTeacher ? (
                      <>
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs">
                            {cls.classTeacher.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium dark:text-white">{cls.classTeacher.user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Class Teacher</p>
                        </div>
                        <GraduationCap className="w-4 h-4 text-green-500" />
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 flex-1">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">No teacher assigned</span>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedClass(cls)}>
                              <UserPlus className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Class Teacher</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p>Select a teacher for Class {cls.name}-{cls.section}:</p>
                              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                  {teachers.map(teacher => (
                                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                      {teacher.user.name} - {teacher.department}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => selectedClass && assignTeacher(selectedClass.id, selectedTeacher)}
                                  disabled={!selectedTeacher}
                                >
                                  Assign Teacher
                                </Button>
                                <Button variant="outline" onClick={() => { setSelectedClass(null); setSelectedTeacher(''); }}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                  </div>

                  {/* Subjects and Teachers */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subjects & Teachers</p>
                    <div className="flex flex-wrap gap-1">
                      {getSubjectsFromTimetable(cls.timetables || []).slice(0, 3).map((subject, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          {subject}
                        </Badge>
                      ))}
                      {getSubjectsFromTimetable(cls.timetables || []).length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          +{getSubjectsFromTimetable(cls.timetables || []).length - 3} more
                        </Badge>
                      )}
                      {getSubjectsFromTimetable(cls.timetables || []).length === 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">No subjects assigned</span>
                      )}
                    </div>
                    {cls.timetables && cls.timetables.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Teaching Staff:</p>
                        <div className="flex flex-wrap gap-1">
                          {[...new Set(cls.timetables.map(tt => tt.teacher?.user?.name).filter(Boolean))].slice(0, 2).map((teacherName, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {teacherName}
                            </Badge>
                          ))}
                          {[...new Set(cls.timetables.map(tt => tt.teacher?.user?.name).filter(Boolean))].length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{[...new Set(cls.timetables.map(tt => tt.teacher?.user?.name).filter(Boolean))].length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={() => { setViewClass(null); setViewStudents(cls); fetchClassForStudents(cls.id); }}>
                      <Users className="w-4 h-4" />
                      Students
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={() => { setViewClass(null); setViewSubjects(cls); fetchClassForSubjects(cls.id); }}>
                      <BookOpen className="w-4 h-4" />
                      Subjects
                    </Button>
                  </div>
                </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredClasses.length === 0 && (
            <Card className="shadow-lg border-0 bg-white dark:bg-slate-800">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No classes found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first class"}
                </p>
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700">
                  <Plus className="w-4 h-4" />
                  Create Class
                </Button>
              </CardContent>
            </Card>
          )}

          {/* View Class Dialog */}
          <Dialog open={!!viewClass && !viewStudents && !viewSubjects} onOpenChange={() => setViewClass(null)}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
              <DialogHeader className="pb-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      Class {viewClass?.name}-{viewClass?.section}
                    </DialogTitle>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Complete class overview and management
                    </p>
                  </div>
                </div>
              </DialogHeader>
              
              {viewClass && (
                <div className="space-y-8 pt-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                      <CardContent className="p-4 text-center">
                        <Users className="w-8 h-8 mx-auto mb-2 text-blue-100" />
                        <p className="text-2xl font-bold">{viewClass.students?.length || 0}</p>
                        <p className="text-blue-100 text-sm">Students</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                      <CardContent className="p-4 text-center">
                        <BookOpen className="w-8 h-8 mx-auto mb-2 text-green-100" />
                        <p className="text-2xl font-bold">{getSubjectsFromTimetable(viewClass.timetables || []).length}</p>
                        <p className="text-green-100 text-sm">Subjects</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                      <CardContent className="p-4 text-center">
                        <GraduationCap className="w-8 h-8 mx-auto mb-2 text-purple-100" />
                        <p className="text-2xl font-bold">{[...new Map((viewClass.timetables || []).map(tt => [tt.teacher?.id, tt.teacher])).values()].filter(Boolean).length}</p>
                        <p className="text-purple-100 text-sm">Teachers</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
                      <CardContent className="p-4 text-center">
                        <Settings className="w-8 h-8 mx-auto mb-2 text-orange-100" />
                        <p className="text-2xl font-bold">{Math.round(((viewClass.students?.length || 0) / 30) * 100)}%</p>
                        <p className="text-orange-100 text-sm">Capacity</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Class Teacher Section */}
                  <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <GraduationCap className="w-5 h-5 text-green-500" />
                        Class Teacher
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {viewClass.classTeacher ? (
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl">
                          <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                            <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white text-lg font-bold">
                              {viewClass.classTeacher.user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{viewClass.classTeacher.user.name}</h3>
                            <p className="text-gray-600 dark:text-gray-300">{viewClass.classTeacher.user.email}</p>
                            <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              Primary Class Teacher
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400 text-lg">No class teacher assigned</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Students Section */}
                  <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Users className="w-5 h-5 text-blue-500" />
                        Students ({viewClass.students?.length || 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {viewClass.students && viewClass.students.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {viewClass.students.map((student, index) => (
                            <div key={student.id || index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl hover:shadow-md transition-all duration-200">
                              <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                                  {student.user?.name?.split(' ').map(n => n[0]).join('') || 'S'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white truncate">{student.user?.name || 'Unknown Student'}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{student.user?.email || ''}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Users className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Students Enrolled</h3>
                          <p className="text-gray-600 dark:text-gray-400">This class doesn't have any students assigned yet.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Teaching Staff & Subjects */}
                  <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <BookOpen className="w-5 h-5 text-purple-500" />
                        Teaching Staff & Subjects
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {viewClass.timetables && viewClass.timetables.length > 0 ? (
                        <div className="space-y-4">
                          {[...new Map(viewClass.timetables.map(tt => [tt.teacher?.id, tt.teacher])).values()].filter(Boolean).map((teacher, index) => {
                            const teacherSubjects = [...new Set(viewClass.timetables.filter(tt => tt.teacher?.id === teacher.id).map(tt => tt.subject?.name).filter(Boolean))];
                            return (
                              <div key={teacher.id || index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                                <Avatar className="w-14 h-14 border-2 border-white shadow-md">
                                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
                                    {teacher.user?.name?.split(' ').map(n => n[0]).join('') || 'T'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{teacher.user?.name || 'Unknown Teacher'}</h4>
                                  <p className="text-gray-600 dark:text-gray-300 mb-3">{teacher.user?.email}</p>
                                  <div className="flex flex-wrap gap-2">
                                    {teacherSubjects.map((subject, idx) => (
                                      <Badge key={idx} className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                                        {subject}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <BookOpen className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Teaching Staff</h3>
                          <p className="text-gray-600 dark:text-gray-400">No teachers or subjects have been assigned to this class yet.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Class Dialog */}
          <Dialog open={!!editClass} onOpenChange={() => setEditClass(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Class</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Class Name</label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    placeholder="Enter class name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Section</label>
                  <Input
                    value={editForm.section}
                    onChange={(e) => setEditForm({...editForm, section: e.target.value})}
                    placeholder="Enter section"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => editClass && updateClass(editClass.id, editForm)}>
                    Update Class
                  </Button>
                  <Button variant="outline" onClick={() => setEditClass(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Students Only Dialog */}
          <Dialog open={!!viewStudents} onOpenChange={() => setViewStudents(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Students in Class {viewStudents?.name}-{viewStudents?.section}
                </DialogTitle>
              </DialogHeader>
              {viewClass && (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{viewClass.students?.length || 0}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Students Enrolled</p>
                  </div>
                  {viewClass.students && viewClass.students.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {viewClass.students.map((student, index) => (
                        <div key={student.id || index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg hover:shadow-md transition-all">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                              {student.user?.name?.split(' ').map(n => n[0]).join('') || 'S'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{student.user?.name || 'Unknown Student'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{student.user?.email || ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No students enrolled in this class</p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Subjects Only Dialog */}
          <Dialog open={!!viewSubjects} onOpenChange={() => setViewSubjects(null)}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-green-500" />
                  Subjects in Class {viewSubjects?.name}-{viewSubjects?.section}
                </DialogTitle>
              </DialogHeader>
              {viewClass && (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{getSubjectsFromTimetable(viewClass.timetables || []).length}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Subjects Taught</p>
                  </div>
                  {viewClass.timetables && viewClass.timetables.length > 0 ? (
                    <div className="space-y-3">
                      {getSubjectsFromTimetable(viewClass.timetables || []).map((subject, index) => {
                        const subjectTeachers = [...new Set(viewClass.timetables.filter(tt => tt.subject?.name === subject).map(tt => tt.teacher?.user?.name).filter(Boolean))];
                        return (
                          <div key={index} className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{subject}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Taught by: {subjectTeachers.join(', ') || 'No teacher assigned'}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No subjects assigned to this class</p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default ClassManagement;