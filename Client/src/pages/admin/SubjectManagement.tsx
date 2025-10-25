import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, BookOpen, Users, GraduationCap, Edit, Trash2, UserPlus, Eye, MoreHorizontal, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import SubjectFormModal from '../../components/admin/SubjectFormModal';
import SubjectAssignModal from '../../components/admin/SubjectAssignModal';
import api, { showApiError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function SubjectManagement(){
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [assigningSubject, setAssigningSubject] = useState<any | null>(null);
  const [viewSubject, setViewSubject] = useState<any>(null);
  const [subjectAssignments, setSubjectAssignments] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const { toast } = useToast();

  const fetchSubjects = async () => {
    setLoading(true);
    try{
      const res = await api.get('/api/subjects');
      setSubjects(res.data.subjects || []);
    }catch(err:any){
      showApiError(toast, err, 'Failed to load subjects');
    }finally{ setLoading(false); }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/api/teachers');
      setTeachers(res.data.teachers || []);
    } catch (err: any) {
      showApiError(toast, err, 'Failed to load teachers');
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get('/api/classes');
      setClasses(res.data.classes || []);
    } catch (err: any) {
      showApiError(toast, err, 'Failed to load classes');
    }
  };

  const fetchSubjectAssignments = async (subjectId: number) => {
    try {
      const res = await api.get(`/api/subjects/${subjectId}/assignments`);
      console.log('Subject assignments response:', res.data); // Debug log
      setSubjectAssignments(res.data.assignments || []);
    } catch (err: any) {
      console.error('Error fetching assignments:', err);
      showApiError(toast, err, 'Failed to load subject assignments');
    }
  };

  const assignTeacherToSubject = async () => {
    if (!selectedTeacher || !selectedClass || !assigningSubject) return;
    try {
      await api.post('/api/subjects/assign', {
        teacherId: parseInt(selectedTeacher),
        classId: parseInt(selectedClass),
        subjectId: assigningSubject.id
      });
      toast({ title: 'Success', description: 'Teacher assigned to subject' });
      setIsAssignOpen(false);
      setSelectedTeacher('');
      setSelectedClass('');
      setAssigningSubject(null);
    } catch (err: any) {
      showApiError(toast, err, 'Failed to assign teacher');
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchTeachers();
    fetchClasses();
  }, []);

  const deleteSubject = async(id:number) => {
    try{
      await api.delete(`/api/subjects/${id}`);
      toast({ title: 'Deleted', description: 'Subject deleted' });
      fetchSubjects();
    }catch(err:any){
      showApiError(toast, err, 'Failed to delete subject');
    }
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      <AdminSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-8 space-y-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subject Management</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Manage subjects and teacher assignments</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Import
              </Button>
              <Button onClick={() => { setEditing(null); setIsModalOpen(true); }} className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <Plus className="w-4 h-4" />
                Add Subject
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Subjects</p>
                    <p className="text-3xl font-bold">{loading ? '...' : subjects.length}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Available Teachers</p>
                    <p className="text-3xl font-bold">{teachers.length}</p>
                  </div>
                  <GraduationCap className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Active Classes</p>
                    <p className="text-3xl font-bold">{classes.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search subjects by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Subjects Grid */}
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
              {filteredSubjects.map((subject) => (
                <Card key={subject.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 shadow-lg hover:-translate-y-1">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl dark:text-white">{subject.name}</CardTitle>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Code: {subject.code}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" onClick={() => { setViewSubject(subject); fetchSubjectAssignments(subject.id); }}>
                            <Eye className="w-4 h-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => { setEditing(subject); setIsModalOpen(true); }}>
                            <Edit className="w-4 h-4" />
                            Edit Subject
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-red-600" onClick={() => deleteSubject(subject.id)}>
                            <Trash2 className="w-4 h-4" />
                            Delete Subject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-4">
                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={() => { setAssigningSubject(subject); setIsAssignOpen(true); }}>
                        <UserPlus className="w-4 h-4" />
                        Assign Teacher
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={() => { setViewSubject(subject); fetchSubjectAssignments(subject.id); }}>
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredSubjects.length === 0 && !loading && (
            <Card className="shadow-lg border-0 bg-white dark:bg-slate-800">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No subjects found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first subject"}
                </p>
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700" onClick={() => { setEditing(null); setIsModalOpen(true); }}>
                  <Plus className="w-4 h-4" />
                  Create Subject
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Assignment Dialog */}
          <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-500" />
                  Assign Teacher to {assigningSubject?.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Teacher</label>
                  <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map(teacher => (
                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                          {teacher.user.name} - {teacher.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Class</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(cls => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          Class {cls.name}-{cls.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={assignTeacherToSubject} disabled={!selectedTeacher || !selectedClass} className="flex-1">
                    Assign Teacher
                  </Button>
                  <Button variant="outline" onClick={() => setIsAssignOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* View Subject Dialog */}
          <Dialog open={!!viewSubject} onOpenChange={() => { setViewSubject(null); setSubjectAssignments([]); }}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  {viewSubject?.name} Details
                </DialogTitle>
              </DialogHeader>
              {viewSubject && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100">Subject Name</h3>
                      <p className="text-blue-700 dark:text-blue-300">{viewSubject.name}</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100">Subject Code</h3>
                      <p className="text-purple-700 dark:text-purple-300">{viewSubject.code}</p>
                    </div>
                  </div>

                  {/* Teacher Assignments */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-green-500" />
                        Assigned Teachers ({subjectAssignments.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {subjectAssignments.length > 0 ? (
                        <div className="space-y-3">
                          {subjectAssignments.map((assignment, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                              <Avatar className="w-12 h-12">
                                <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold">
                                  {assignment.teacher.user.name.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white">{assignment.teacher.user.name}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{assignment.teacher.user.email}</p>
                              </div>
                              <div className="text-right">
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                  Class {assignment.class.name}-{assignment.class.section}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400">No teachers assigned to this subject yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => { setEditing(viewSubject); setIsModalOpen(true); setViewSubject(null); }} className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Subject
                    </Button>
                    <Button variant="outline" onClick={() => { setAssigningSubject(viewSubject); setIsAssignOpen(true); setViewSubject(null); }} className="flex-1">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Assign Teacher
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {typeof window !== 'undefined' && (
            <React.Suspense>
              <SubjectFormModal open={isModalOpen} initial={editing} onOpenChange={setIsModalOpen} onSaved={fetchSubjects} />
            </React.Suspense>
          )}
        </main>
      </div>
    </div>
  );
}
