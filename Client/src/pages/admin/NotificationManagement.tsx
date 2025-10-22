import React, { useEffect, useState, useMemo } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import NotificationFormModal from '../../components/admin/NotificationFormModal';
import NotificationPreviewDrawer from '@/components/admin/NotificationPreviewDrawer';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus } from 'lucide-react';

export default function NotificationManagement(){
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedId, setSelectedId] = useState<number | null>(null);
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

  useEffect(() => { setPage(1); }, [query]);

  const visibleNotifications = useMemo(() => {
    return notifications
      .filter(n => (n.title || '').toLowerCase().includes(query.toLowerCase()) || (n.message || '').toLowerCase().includes(query.toLowerCase()))
      .slice((page-1)*pageSize, page*pageSize);
  }, [notifications, query, page]);

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
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <Input placeholder="Search notifications..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-72" />
              </div>
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
              ) : visibleNotifications.length === 0 ? (
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
                      {visibleNotifications.map(n => (
                        <TableRow key={n.id} className="hover:bg-muted/50">
                          <TableCell>{n.title}</TableCell>
                          <TableCell>{n.targetRole ? (n.targetRole.charAt(0).toUpperCase() + n.targetRole.slice(1).toLowerCase()) : ''}</TableCell>
                          <TableCell className="max-w-xl truncate">{n.message}</TableCell>
                          <TableCell>{new Date(n.createdAt).toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" onClick={() => setSelectedId(n.id)}>View</Button>
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

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {Math.min(notifications.length, (page)*pageSize)} of {notifications.length}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}>Prev</Button>
              <div className="px-3">Page {page}</div>
              <Button size="sm" variant="outline" onClick={() => setPage(p => p+1)} disabled={page*pageSize >= notifications.filter(n => (n.title||'').toLowerCase().includes(query.toLowerCase()) || (n.message||'').toLowerCase().includes(query.toLowerCase())).length}>Next</Button>
            </div>
          </div>

          {typeof window !== 'undefined' && (
            <NotificationFormModal open={isModalOpen} onOpenChange={setIsModalOpen} onSaved={fetchNotifications} />
          )}

          {typeof window !== 'undefined' && (
            <NotificationPreviewDrawer id={selectedId} open={Boolean(selectedId)} onOpenChange={(v) => { if (!v) setSelectedId(null); }} />
          )}

        </main>
      </div>
    </div>
  );
}
