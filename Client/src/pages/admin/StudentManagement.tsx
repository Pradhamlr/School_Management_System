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
  Upload,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/lib/api';

const StudentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  
  const { toast } = useToast();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const api = await import('@/lib/api').then(m => m.default);
      const res = await api.get('/api/students');
      // backend returns { success: true, students }
      setStudents(res.data.students || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to load students', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // fetch analytics totals for cards
  useEffect(() => {
    let mounted = true;
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/api/analytics');
        if (!mounted) return;
        // we don't store globally; just set values into DOM state below if needed
        setAnalytics(res.data.data);
      } catch (e) {
        console.error('Failed to fetch analytics', e);
      }
    };
    fetchAnalytics();
    return () => { mounted = false; };
  }, []);

  const [analytics, setAnalytics] = React.useState<any | null>(null);

  const filteredStudents = students.filter(student => {
    const name = student?.user?.name || '';
    const email = student?.user?.email || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const [deletingStudentId, setDeletingStudentId] = useState<number | null>(null);
  const deleteStudent = async (id: number) => {
    setDeletingStudentId(id);
  };
  const confirmDeleteStudent = async () => {
    if (!deletingStudentId) return;
    try {
      const api = await import('@/lib/api').then(m => m.default);
      await api.delete(`/api/students/${deletingStudentId}`);
      toast({ title: 'Deleted', description: 'Student deleted successfully' });
      fetchStudents();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to delete student', variant: 'destructive' });
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
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Import
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700" onClick={() => { setEditing(null); setIsModalOpen(true); }}>
                <Plus className="w-4 h-4" />
                Add Student
              </Button>
            </div>
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
                    <p className="text-3xl font-bold">127</p>
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
                    <p className="text-3xl font-bold">89%</p>
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

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle>All Students</CardTitle>
              <CardDescription>
                Showing {filteredStudents.length} of {students.length} students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>GPA</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                              {(student.user?.name || '').split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.user?.name}</p>
                            <p className="text-sm text-muted-foreground">{student.user?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{student.rollNumber || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.classId || '-'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Student</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">-</span>
                      </TableCell>
                      <TableCell className="font-medium">-</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Student form modal */}
          {typeof window !== 'undefined' && (
            // dynamic import to avoid SSR issues
            <React.Suspense>
              <StudentFormModal
                initial={editing}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSaved={fetchStudents}
              />
            </React.Suspense>
          )}

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