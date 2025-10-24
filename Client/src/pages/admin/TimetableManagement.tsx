import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import TimetableFormModal from '@/components/admin/TimetableFormModal';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const TimetableManagement = () => {
  const [timetables, setTimetables] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const fetchTimetables = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/timetables');
      setTimetables(res.data.data || res.data || []);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load timetables', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTimetables(); }, []);

  const handleSaved = () => { fetchTimetables(); };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this timetable slot?')) return;
    try {
      await api.delete(`/api/timetables/${id}`);
      toast({ title: 'Deleted', description: 'Timetable slot removed' });
      fetchTimetables();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to delete', variant: 'destructive' });
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Timetable Management</h1>
            <div className="flex gap-2">
              <Button onClick={() => setOpen(true)}>Add Slot</Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All timetable slots</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <div>Loading...</div> : (
                <div className="space-y-3">
                  {timetables.map((t) => (
                    <div key={t.id} className="p-3 rounded-md bg-white shadow-sm flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{t.subject?.name} — {t.class?.name} {t.class?.section ? `- ${t.class.section}` : ''}</div>
                        <div className="text-sm text-muted-foreground">{t.day} • {formatTime(t.startMinute)} - {formatTime(t.endMinute)} • {t.teacher?.user?.name} • {t.classroom?.name}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => alert('Edit not implemented yet')}>Edit</Button>
                        <Button variant="destructive" onClick={() => handleDelete(t.id)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <TimetableFormModal open={open} onOpenChange={setOpen} onSaved={handleSaved} />
        </main>
      </div>
    </div>
  );

  function formatTime(minutes: number) {
    if (typeof minutes !== 'number') return '';
    const hh = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mm = (minutes % 60).toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }
};

export default TimetableManagement;
