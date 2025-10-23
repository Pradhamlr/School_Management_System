import AdminSidebar from "@/components/AdminSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ClassFormModal from '@/components/admin/ClassFormModal';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ClassManagement = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [assigningClassId, setAssigningClassId] = useState<number | null>(null);
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/classes');
      setClasses(res.data.classes || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to load classes', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  const deleteClass = async (id: number) => {
    setDeletingClassId(id);
  };

  const [deletingClassId, setDeletingClassId] = useState<number | null>(null);
  const confirmDeleteClass = async () => {
    if (!deletingClassId) return;
    try {
      await api.delete(`/api/classes/${deletingClassId}`);
      toast({ title: 'Deleted', description: 'Class deleted' });
      fetchClasses();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to delete class', variant: 'destructive' });
    } finally {
      setDeletingClassId(null);
    }
  };

  const assignTeacher = async (classId: number) => {
    // open assign modal and load teachers
    setAssigningClassId(classId);
    try {
      const res = await api.get('/api/teachers');
      setTeachersList(res.data.teachers || []);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to load teachers', variant: 'destructive' });
      return;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Class Management</h1>
              <p className="text-gray-600 mt-1">Manage classes and subjects</p>
            </div>
            <div>
              <Button onClick={() => { setEditing(null); setIsModalOpen(true); }} className="bg-gradient-to-r from-indigo-600 to-indigo-700 gap-2">
                Add Class
              </Button>
            </div>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>All Classes</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="p-8 text-center text-sm text-muted-foreground">Loading classes…</div>
              ) : classes.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-600">No classes yet. Click Add Class to create one.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Class Teacher</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted/50">
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.section}</TableCell>
                      <TableCell>{c.classTeacher?.user?.name || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setEditing(c); setIsModalOpen(true); }}>Edit</Button>
                          <Button size="sm" variant="ghost" onClick={() => assignTeacher(c.id)}>Assign Teacher</Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteClass(c.id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {typeof window !== 'undefined' && (
            <ClassFormModal initial={editing} open={isModalOpen} onOpenChange={setIsModalOpen} onSaved={fetchClasses} />
          )}

          <Dialog open={Boolean(deletingClassId)} onOpenChange={(v) => { if (!v) setDeletingClassId(null); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm delete</DialogTitle>
              </DialogHeader>
              <p className="p-2">Are you sure you want to delete this class? This action cannot be undone.</p>
              <div className="flex justify-end gap-2 p-2">
                <Button variant="outline" onClick={() => setDeletingClassId(null)}>Cancel</Button>
                <Button variant="destructive" onClick={() => confirmDeleteClass()}>Delete</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Assign teacher modal */}
          <Dialog open={Boolean(assigningClassId)} onOpenChange={(v) => { if (!v) { setAssigningClassId(null); setSelectedTeacherId(null); } }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Class Teacher</DialogTitle>
              </DialogHeader>
                <form className="space-y-4 p-2" onSubmit={async (e) => {
                  e.preventDefault();
                  if (!assigningClassId || !selectedTeacherId) {
                    toast({ title: 'Error', description: 'Select a teacher to assign', variant: 'destructive' });
                    return;
                  }
                  try {
                    await api.post(`/api/classes/${assigningClassId}/teacher`, { classTeacherId: Number(selectedTeacherId) });
                    toast({ title: 'Assigned', description: 'Class teacher assigned' });
                    setAssigningClassId(null);
                    setSelectedTeacherId(null);
                    fetchClasses();
                  } catch (err: any) {
                    toast({ title: 'Error', description: err?.response?.data?.message || err?.message || 'Failed to assign teacher', variant: 'destructive' });
                  }
                }}>
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Teacher</label>
                    <Select onValueChange={(val) => setSelectedTeacherId(Number(val))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachersList.map(t => (
                          <SelectItem key={t.id} value={String(t.id)}>{t.user?.name || t.user?.email || `Teacher ${t.id}`}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setAssigningClassId(null); setSelectedTeacherId(null); }}>Cancel</Button>
                    <Button type="submit">Assign</Button>
                  </DialogFooter>
                </form>
            </DialogContent>
          </Dialog>

        </main>
      </div>
    </div>
  );
};

export default ClassManagement;