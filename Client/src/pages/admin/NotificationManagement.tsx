import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import NotificationFormModal from '../../components/admin/NotificationFormModal';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus } from 'lucide-react';

export default function NotificationManagement(){
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    setLoading(true);
    try{
      const apiClient = await import('@/lib/api').then(m => m.default);
      const res = await apiClient.get('/api/notifications');
      setNotifications(res.data.data || []);
    }catch(err:any){
      toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to load notifications', variant: 'destructive' });
    }finally{ setLoading(false); }
  };

  useEffect(()=>{ fetchNotifications(); }, []);

  const confirmDelete = async (id:number) => {
    setDeletingId(id);
    try{
      const apiClient = await import('@/lib/api').then(m=>m.default);
      await apiClient.delete(`/api/notifications/${id}`);
      toast({ title: 'Deleted', description: 'Notification deleted' });
      fetchNotifications();
    }catch(err:any){
      toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to delete', variant: 'destructive' });
    }finally{ setDeletingId(null); }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-1">Create and manage announcements</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-indigo-600 to-indigo-700 gap-2">
                <Plus className="w-4 h-4" />
                Create Notification
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-600">No notifications yet. Create one to broadcast to users.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notifications.map(n => (
                        <TableRow key={n.id} className="hover:bg-muted/50">
                          <TableCell>{n.title}</TableCell>
                          <TableCell>{n.targetRole}</TableCell>
                          <TableCell className="max-w-xl truncate">{n.message}</TableCell>
                          <TableCell>{new Date(n.createdAt).toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="destructive" onClick={() => confirmDelete(n.id)} disabled={deletingId===n.id}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
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
            <NotificationFormModal open={isModalOpen} onOpenChange={setIsModalOpen} onSaved={fetchNotifications} />
          )}

        </main>
      </div>
    </div>
  );
}
