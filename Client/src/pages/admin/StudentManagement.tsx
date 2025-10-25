import React, { useState, useEffect } from "react";
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  DownloadCloud,
  MoreHorizontal
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
import StudentFormModal from '@/components/admin/StudentFormModal';
import StudentDetailsModal from '@/components/admin/StudentDetailsModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api, { showApiError } from '@/lib/api';

const StudentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  
  const { toast } = useToast();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/students');
      // backend returns { success: true, students }
      console.debug('fetchStudents response', res);
      setStudents(res.data.students || []);
    } catch (err: any) {
      showApiError(toast, err, 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const [analytics, setAnalytics] = React.useState<any | null>(null);

  useEffect(() => {
    // initial load
    fetchStudents();

    // also load classes so we can show name/section instead of id
    (async () => {
      try {
        const res = await api.get('/api/classes');
        setClasses(res.data.classes || []);
      } catch (e) {
        console.warn('Failed to load classes', e);
      }
    })();
  }, []);

  // fetch analytics totals for cards
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

  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 180);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const filteredStudents = students.filter(student => {
    const name = student?.user?.name || '';
    const email = student?.user?.email || '';
    const cls = classes.find(c => c.id === student.classId);
    const classLabel = cls ? `${cls.name}${cls.section ? ` ${cls.section}` : ''}` : (student.classId ? String(student.classId) : '');
    return (
      name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      classLabel.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  });

  const [deletingStudentId, setDeletingStudentId] = useState<number | null>(null);
  // debugInfo removed per UX request
  const deleteStudent = async (id: number) => {
    setDeletingStudentId(id);
  };
  const confirmDeleteStudent = async () => {
    if (!deletingStudentId) return;
    try {
      await api.delete(`/api/students/${deletingStudentId}`);
      toast({ title: 'Deleted', description: 'Student deleted successfully' });
      fetchStudents();
      // refresh analytics when list changes
      try { await api.get('/api/analytics').then(r => setAnalytics(r.data.data)); } catch(e){}
    } catch (err: any) {
      showApiError(toast, err, 'Failed to delete student');
    } finally {
      setDeletingStudentId(null);
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
              <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
              <p className="text-gray-600 mt-1">Manage and monitor all student records</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2" onClick={() => {
                // Export visible table rows as CSV
                try {
                  const rows = filteredStudents.map(s => ({
                    id: s.id,
                    name: s.user?.name || '',
                    email: s.user?.email || '',
                    rollNumber: s.rollNumber || '',
                    class: (() => {
                      const cls = classes.find(c => c.id === s.classId);
                      return cls ? `${cls.name}${cls.section ? ` ${cls.section}` : ''}` : (s.classId || '');
                    })(),
                  }));

                  const header = ['id','name','email','rollNumber','class'];
                  const csv = [header.join(',')].concat(rows.map(r => header.map(h => `"${String((r as any)[h] ?? '').replace(/"/g, '""')}"`).join(','))).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `students-export-${new Date().toISOString().slice(0,10)}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                } catch (e) {
                  toast({ title: 'Export failed', description: String(e), variant: 'destructive' });
                }
              }}>
                <DownloadCloud className="w-4 h-4" />
                Export
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700" onClick={() => { setEditing(null); setIsModalOpen(true); }}>
                <Plus className="w-4 h-4" />
                Add Student
              </Button>
            </div>
            {/* debug panel removed */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Students</p>
                    <p className="text-3xl font-bold">{analytics ? analytics.attendance.totalStudents : '…'}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Active Students</p>
                    <p className="text-3xl font-bold">{analytics ? analytics.attendance.studentsPresentToday : '…'}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">New This Month</p>
                    <p className="text-3xl font-bold">{analytics ? (analytics.academics?.monthlyNewStudents ?? '—') : '…'}</p>
                  </div>
                  <Plus className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Avg. Attendance</p>
                    <p className="text-3xl font-bold">{analytics ? `${analytics.attendance.studentAttendanceRate ?? '—'}%` : '…'}</p>
                  </div>
                  <Eye className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search students..."
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

          {/* Students Grid */}
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
              {filteredStudents.map((student) => {
                const cls = classes.find(c => c.id === student.classId);
                const classLabel = cls ? `${cls.name}${cls.section ? `-${cls.section}` : ''}` : 'No Class';
                return (
                  <Card key={student.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 shadow-lg hover:-translate-y-1">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                              {(student.user?.name || '').split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg dark:text-white">{student.user?.name || 'Unknown'}</CardTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{student.user?.email}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2" onClick={() => setSelectedStudent(student)}>
                              <Eye className="w-4 h-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onClick={() => { setEditing(student); setIsModalOpen(true); }}>
                              <Edit className="w-4 h-4" />
                              Edit Student
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-red-600" onClick={() => deleteStudent(student.id)}>
                              <Trash2 className="w-4 h-4" />
                              Delete Student
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-5">
                      {/* Student Info */}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                          {student.rollNumber || 'No Roll'}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Active
                        </Badge>
                      </div>

                      {/* Class Info */}
                      <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium dark:text-white">Class {classLabel}</span>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Attendance</p>
                          <p className="font-semibold text-purple-700 dark:text-purple-300">-</p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <p className="text-xs text-orange-600 dark:text-orange-400 mb-1">GPA</p>
                          <p className="font-semibold text-orange-700 dark:text-orange-300">-</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-3">
                        <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={() => setSelectedStudent(student)}>
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={() => { setEditing(student); setIsModalOpen(true); }}>
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
          {filteredStudents.length === 0 && !loading && (
            <Card className="shadow-lg border-0 bg-white dark:bg-slate-800">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No students found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first student"}
                </p>
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700" onClick={() => { setEditing(null); setIsModalOpen(true); }}>
                  <Plus className="w-4 h-4" />
                  Add Student
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Student form modal (render directly) */}
          <StudentFormModal
            initial={editing}
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            onSaved={fetchStudents}
          />

          <StudentDetailsModal
            open={Boolean(selectedStudent)}
            onOpenChange={(v) => { if (!v) setSelectedStudent(null); }}
            student={selectedStudent}
          />

          {/* Delete confirmation dialog */}
          <Dialog open={Boolean(deletingStudentId)} onOpenChange={(v) => { if (!v) setDeletingStudentId(null); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm delete</DialogTitle>
              </DialogHeader>
              <p className="p-2">Are you sure you want to delete this student? This action cannot be undone.</p>
              <div className="flex justify-end gap-2 p-2">
                <Button variant="outline" onClick={() => setDeletingStudentId(null)}>Cancel</Button>
                <Button variant="destructive" onClick={() => confirmDeleteStudent()}>Delete</Button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default StudentManagement;