import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SubjectFormModal from '../../components/admin/SubjectFormModal';
import SubjectAssignModal from '../../components/admin/SubjectAssignModal';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function SubjectManagement(){
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [assigningSubject, setAssigningSubject] = useState<any | null>(null);
  const { toast } = useToast();

  const fetchSubjects = async () => {
    setLoading(true);
    try{
      const res = await api.get('/api/subjects');
      setSubjects(res.data.subjects || []);
    }catch(err:any){
      toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to load subjects', variant: 'destructive' });
    }finally{ setLoading(false); }
  };

  useEffect(()=>{ fetchSubjects(); }, []);

  const deleteSubject = async(id:number) => {
    try{
      await api.delete(`/api/subjects/${id}`);
      toast({ title: 'Deleted', description: 'Subject deleted' });
      fetchSubjects();
    }catch(err:any){
      toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to delete subject', variant: 'destructive' });
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Subject Management</h1>
              <p className="text-gray-600 mt-1">Create and assign subjects</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Import
              </Button>
              <Button onClick={()=>{ setEditing(null); setIsModalOpen(true); }} className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700">
                <Plus className="w-4 h-4" />
                Add Subject
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="p-8 text-center text-sm text-muted-foreground">Loading subjects…</div>
              ) : subjects.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-600">No subjects yet. Click Add Subject to create one.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map(s=> (
                    <TableRow key={s.id} className="hover:bg-muted/50">
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.code}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={()=>{ setEditing(s); setIsModalOpen(true); }}>Edit</Button>
                          <Button size="sm" variant="ghost" onClick={()=>{ setAssigningSubject(s); setIsAssignOpen(true); }}>Assign</Button>
                          <Button size="sm" variant="destructive" onClick={()=>deleteSubject(s.id)}>Delete</Button>
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
            <React.Suspense>
              <SubjectFormModal open={isModalOpen} initial={editing} onOpenChange={setIsModalOpen} onSaved={fetchSubjects} />
              <SubjectAssignModal open={isAssignOpen} subject={assigningSubject} onOpenChange={setIsAssignOpen} onSaved={fetchSubjects} />
            </React.Suspense>
          )}
        </main>
      </div>
    </div>
  );
}
