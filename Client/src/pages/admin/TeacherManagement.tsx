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
  Upload,
  MoreHorizontal,
  Mail,
  Phone
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/lib/api';

const TeacherManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deletingTeacherId, setDeletingTeacherId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const api = await import('@/lib/api').then(m => m.default);
      const res = await api.get('/api/teachers');
      setTeachers(res.data.teachers || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to load teachers', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
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

  const filteredTeachers = teachers.filter(teacher =>
    (teacher.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (teacher.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (teacher.department || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteTeacher = async (id: number) => {
    setDeletingTeacherId(id);
  };

  const confirmDeleteTeacher = async () => {
    if (!deletingTeacherId) return;
    try {
      const api = await import('@/lib/api').then(m => m.default);
      await api.delete(`/api/teachers/${deletingTeacherId}`);
      toast({ title: 'Removed', description: 'Teacher removed successfully' });
      fetchTeachers();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to remove teacher', variant: 'destructive' });
    } finally {
      setDeletingTeacherId(null);
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
                <Upload className="w-4 h-4" />
                Import
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-green-600 to-green-700" onClick={() => { setEditing(null); setIsModalOpen(true); }}>
                <Plus className="w-4 h-4" />
                Add Teacher
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                    <p className="text-3xl font-bold">{analytics ? analytics.attendance.teachersPresentToday : '…'}</p>
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
                    <p className="text-3xl font-bold">{analytics ? analytics.departmentCount ?? '—' : '…'}</p>
                  </div>
                  <GraduationCap className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Avg. Experience</p>
                    <p className="text-3xl font-bold">{analytics ? (analytics.avgTeacherExperience ? `${analytics.avgTeacherExperience}y` : '—') : '…'}</p>
                  </div>
                  <GraduationCap className="w-8 h-8 text-orange-200" />
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

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle>All Teachers</CardTitle>
              <CardDescription>
                Showing {filteredTeachers.length} of {teachers.length} teachers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Classes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                              {(teacher.user?.name || '').split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{teacher.user?.name || '-'}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {teacher.user?.email || '-'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {teacher.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(teacher.subjects || []).map((subject: any, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {subject.name || subject}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                          <Badge 
                            variant={(teacher.status || 'Active') === 'Active' ? 'default' : 'secondary'}
                            className={
                              (teacher.status || 'Active') === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {teacher.status || 'Active'}
                          </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{teacher.experience}</TableCell>
                      <TableCell>
                        <span className="font-medium">{teacher.classes || 0}</span>
                        <span className="text-muted-foreground text-sm ml-1">classes</span>
                      </TableCell>
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
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onClick={() => { setEditing(teacher); setIsModalOpen(true); }}>
                              <Edit className="w-4 h-4" />
                              Edit Teacher
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Mail className="w-4 h-4" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-red-600" onClick={() => deleteTeacher(teacher.id)}>
                              <Trash2 className="w-4 h-4" />
                              Remove Teacher
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