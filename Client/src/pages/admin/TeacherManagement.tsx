import React, { useState, useEffect } from "react";
import { useToast } from '@/hooks/use-toast';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  DownloadCloud,
  Upload,
  MoreHorizontal,
  Mail,
  Phone,
  ToggleLeft, 
  CheckCircle,
  Users
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TeacherFormModal from '@/components/admin/TeacherFormModal';
import TeacherDetailsModal from '@/components/admin/TeacherDetailsModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api, { showApiError } from '@/lib/api';

const TeacherManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<Array<{name:string,count:number}>>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [deletingTeacherId, setDeletingTeacherId] = useState<number | null>(null);
  const [statusLoading, setStatusLoading] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/teachers');
      setTeachers(res.data.teachers || []);
      // also refresh analytics after fetching teachers to keep totals in sync
      try { const a = await api.get('/api/analytics'); setAnalytics(a.data.data); } catch(e){}
    } catch (err: any) {
      showApiError(toast, err, 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await api.get('/api/departments');
        setDepartments(res.data.departments || []);
      } catch (e) {
        console.warn('Failed to load departments', e);
      }
    };
    loadDepartments();
  }, []);

  useEffect(() => {
    const handler = () => fetchTeachers();
    window.addEventListener('subject-assigned', handler as EventListener);
    // also refresh when attendance changes elsewhere in the app
    const attendanceHandler = () => fetchTeachers();
    window.addEventListener('attendance-changed', attendanceHandler as EventListener);
    return () => {
      window.removeEventListener('subject-assigned', handler as EventListener);
      window.removeEventListener('attendance-changed', attendanceHandler as EventListener);
    };
  }, []);

  const [analytics, setAnalytics] = React.useState<any | null>(null);
  useEffect(() => {
    let mounted = true;
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/api/analytics');
        if (!mounted) return;
        setAnalytics(res.data.data);
      } catch (e) {
        console.error('Failed to fetch analytics', e);
      }
    };
    fetchAnalytics();
    return () => { mounted = false; };
  }, []);

  // simple debounced search: apply filter only after user stops typing for 180ms
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 180);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const filteredTeachers = teachers.filter(teacher =>
    ((teacher.user?.name || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (teacher.user?.email || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (teacher.department || '').toLowerCase().includes(debouncedSearch.toLowerCase()))
    && (selectedDepartment ? (teacher.department === selectedDepartment) : true)
  );

  const activeTeachersCount = teachers.filter(t => (t.status || 'Active') === 'Active').length;

  const deleteTeacher = async (id: number) => {
    setDeletingTeacherId(id);
  };

  const confirmDeleteTeacher = async () => {
    if (!deletingTeacherId) return;
    try {
      await api.delete(`/api/teachers/${deletingTeacherId}`);
      toast({ title: 'Removed', description: 'Teacher removed successfully' });
      fetchTeachers();
    } catch (err: any) {
      showApiError(toast, err, 'Failed to remove teacher');
    } finally {
      setDeletingTeacherId(null);
    }
  };

  const toggleTeacherStatus = async (teacher: any) => {
    const id = teacher.id;
    // prevent double clicks
    if (statusLoading[id]) return;
    setStatusLoading(prev => ({ ...prev, [id]: true }));
    // optimistic UI update: flip status locally while request is in-flight
    const prevTeachers = teachers;
    try {
      const newStatus = (teacher.status || 'Active') === 'Active' ? 'Inactive' : 'Active';
      setTeachers((t) => t.map((x) => (x.id === id ? { ...x, status: newStatus } : x)));

      // dynamically import api like other handlers to ensure runtime config/token is applied
  const res = await api.patch(`/api/teachers/${id}`, { status: newStatus });
      if (res?.data?.success) {
        toast({ title: 'Updated', description: `Teacher marked ${newStatus}` });
      } else {
        // treat non-success as error
        throw new Error(res?.data?.message || 'Update failed');
      }

      // refresh serverside data and analytics to ensure consistency
      await fetchTeachers();
      window.dispatchEvent(new CustomEvent('attendance-changed', { detail: { teacherId: id, status: newStatus } }));
      return res.data;
    } catch (err: any) {
      // rollback optimistic update
      setTeachers(prevTeachers);
      console.error('Failed to toggle status', err);
  const msg = err?.response?.data?.message || err?.message || 'Failed to update status';
  showApiError(toast, err, msg);
      return null;
    } finally {
      setStatusLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />
      
      <div className="flex-1">
        <DashboardHeader />
        
        <main className="p-8 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
              <p className="text-gray-600 mt-1">Manage faculty and staff members</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <DownloadCloud className="w-4 h-4" />
                Export
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-green-600 to-green-700" onClick={() => { setEditing(null); setIsModalOpen(true); }}>
                <Plus className="w-4 h-4" />
                Add Teacher
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Total Teachers</p>
                    <p className="text-3xl font-bold">{analytics ? analytics.attendance.totalTeachers : '…'}</p>
                  </div>
                  <GraduationCap className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                      <p className="text-blue-100">Active Teachers</p>
                      <p className="text-3xl font-bold">{typeof activeTeachersCount === 'number' ? activeTeachersCount : (analytics ? analytics.attendance.teachersPresentToday : '…')}</p>
                  </div>
                  <GraduationCap className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Departments</p>
                    <p className="text-3xl font-bold">{departments && departments.length > 0 ? departments.length : (analytics ? analytics.meta?.departmentCount ?? '—' : '…')}</p>
                  </div>
                  <GraduationCap className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
            {/* Removed Avg. Experience card - not used by backend */}
          </div>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search teachers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Teachers Grid */}
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
              {filteredTeachers.map((teacher) => {
                const isActive = (teacher.status || 'Active') === 'Active';
                return (
                  <Card key={teacher.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 shadow-lg hover:-translate-y-1">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                            <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold">
                              {(teacher.user?.name || '').split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg dark:text-white">{teacher.user?.name || 'Unknown'}</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {teacher.user?.email}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2" onClick={() => setSelectedTeacher(teacher)}>
                              <Eye className="w-4 h-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onClick={() => toggleTeacherStatus(teacher)}>
                              <ToggleLeft className="w-4 h-4" />
                              {statusLoading[teacher.id] ? 'Updating…' : (isActive ? 'Mark Inactive' : 'Mark Active')}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onClick={() => { setEditing(teacher); setIsModalOpen(true); }}>
                              <Edit className="w-4 h-4" />
                              Edit Teacher
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-red-600" onClick={() => deleteTeacher(teacher.id)}>
                              <Trash2 className="w-4 h-4" />
                              Remove Teacher
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-5">
                      {/* Status and Department */}
                      <div className="flex items-center justify-between">
                        <Badge className={isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'}>
                          {teacher.status || 'Active'}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                          {(!teacher.department || teacher.department === '_') ? 'No Dept' : teacher.department}
                        </Badge>
                      </div>

                      {/* Subjects */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Subjects</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(teacher.subjects || []).slice(0, 3).map((subject: any, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                              {typeof subject === 'string' ? subject : (subject?.name || subject?.code || 'Subject')}
                            </Badge>
                          ))}
                          {(teacher.subjects || []).length > 3 && (
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                              +{(teacher.subjects || []).length - 3} more
                            </Badge>
                          )}
                          {(!teacher.subjects || teacher.subjects.length === 0) && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">No subjects assigned</span>
                          )}
                        </div>
                      </div>

                      {/* Class Teacher Info - Only show if teacher is a class teacher */}
                      {(teacher.advisedClasses && teacher.advisedClasses.length > 0) && (
                        <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Class Teacher</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {teacher.advisedClasses.map((c: any) => (
                              <Badge key={c.id} className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                Class {c.name}{c.section ? `-${c.section}` : ''}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Teaching Assignments - Only show if teacher has subject assignments */}
                      {(teacher.teachingAssignments && teacher.teachingAssignments.length > 0) && (
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-900 dark:text-green-100">Teaching Classes</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {[...new Set(teacher.teachingAssignments.map((ta: any) => ta.class).filter(Boolean))].map((c: any) => (
                              <Badge key={c.id} variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                {c.name}{c.section ? `-${c.section}` : ''}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-3">
                        <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={() => setSelectedTeacher(teacher)}>
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={() => { setEditing(teacher); setIsModalOpen(true); }}>
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {filteredTeachers.length === 0 && !loading && (
            <Card className="shadow-lg border-0 bg-white dark:bg-slate-800">
              <CardContent className="p-12 text-center">
                <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No teachers found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first teacher"}
                </p>
                <Button className="gap-2 bg-gradient-to-r from-green-600 to-green-700" onClick={() => { setEditing(null); setIsModalOpen(true); }}>
                  <Plus className="w-4 h-4" />
                  Add Teacher
                </Button>
              </CardContent>
            </Card>
          )}
          {typeof window !== 'undefined' && (
            <React.Suspense>
              <TeacherFormModal
                initial={editing}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSaved={fetchTeachers}
              />
            </React.Suspense>
          )}
          <TeacherDetailsModal
            open={Boolean(selectedTeacher)}
            onOpenChange={(v) => { if (!v) setSelectedTeacher(null); }}
            teacher={selectedTeacher}
          />
          <Dialog open={Boolean(deletingTeacherId)} onOpenChange={(v) => { if (!v) setDeletingTeacherId(null); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm remove</DialogTitle>
              </DialogHeader>
              <p className="p-2">Remove this teacher? This action cannot be undone.</p>
              <div className="flex justify-end gap-2 p-2">
                <Button variant="outline" onClick={() => setDeletingTeacherId(null)}>Cancel</Button>
                <Button variant="destructive" onClick={() => confirmDeleteTeacher()}>Remove</Button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default TeacherManagement;