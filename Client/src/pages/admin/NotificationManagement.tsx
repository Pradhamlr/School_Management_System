import React, { useEffect, useState, useMemo } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import NotificationFormModal from '../../components/admin/NotificationFormModal';
import NotificationPreviewDrawer from '@/components/admin/NotificationPreviewDrawer';
import api, { showApiError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, Bell, Users, Eye, AlertCircle, Info, CheckCircle } from 'lucide-react';

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
  const res = await api.get('/api/notifications');
      setNotifications(res.data.data || []);
    }catch(err:any){
      showApiError(toast, err, 'Failed to load notifications');
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
  await api.delete(`/api/notifications/${id}`);
      toast({ title: 'Deleted', description: 'Notification deleted' });
      fetchNotifications();
    }catch(err:any){
      showApiError(toast, err, 'Failed to delete');
    }finally{ setDeletingId(null); }
  };

  const getPriorityIcon = (title: string, message: string) => {
    const text = (title + ' ' + message).toLowerCase();
    if (text.includes('urgent') || text.includes('emergency') || text.includes('important')) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
    if (text.includes('reminder') || text.includes('deadline')) {
      return <Info className="w-5 h-5 text-amber-500" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const getPriorityColor = (title: string, message: string) => {
    const text = (title + ' ' + message).toLowerCase();
    if (text.includes('urgent') || text.includes('emergency') || text.includes('important')) {
      return 'border-l-red-500 bg-red-50/50';
    }
    if (text.includes('reminder') || text.includes('deadline')) {
      return 'border-l-amber-500 bg-amber-50/50';
    }
    return 'border-l-green-500 bg-green-50/50';
  };

  const getTargetBadgeColor = (role: string) => {
    switch(role?.toLowerCase()) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Broadcast Center</h1>
              <p className="text-gray-600 mt-1">Send announcements and manage communications</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <Input placeholder="Search announcements..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-72" />
              </div>
              <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-violet-600 to-violet-700 gap-2">
                <Plus className="w-4 h-4" />
                New Broadcast
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Broadcasts</p>
                    <p className="text-2xl font-bold">{notifications.length}</p>
                  </div>
                  <Bell className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">This Week</p>
                    <p className="text-2xl font-bold">{notifications.filter(n => new Date(n.createdAt) > new Date(Date.now() - 7*24*60*60*1000)).length}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Active Channels</p>
                    <p className="text-2xl font-bold">{new Set(notifications.map(n => n.targetRole)).size}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <Card className="p-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <div className="text-muted-foreground">Loading broadcasts...</div>
            </Card>
          ) : visibleNotifications.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No broadcasts found</h3>
              <p className="text-muted-foreground mb-4">Create your first announcement to reach your audience</p>
              <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-violet-600 to-violet-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Broadcast
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {visibleNotifications.map(n => (
                <Card key={n.id} className={`hover:shadow-lg transition-all duration-300 border-l-4 ${getPriorityColor(n.title, n.message)}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1">
                          {getPriorityIcon(n.title, n.message)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{n.title}</h3>
                            {n.targetRole && (
                              <Badge className={`${getTargetBadgeColor(n.targetRole)} border-0`}>
                                {n.targetRole.charAt(0).toUpperCase() + n.targetRole.slice(1).toLowerCase()}
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-700 mb-3 leading-relaxed">{n.message}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Bell className="w-4 h-4" />
                              Sent {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline" onClick={() => setSelectedId(n.id)} className="gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => confirmDelete(n.id)} disabled={deletingId===n.id}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-muted-foreground">Broadcast delivered</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ID: {n.id}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {notifications.filter(n => (n.title||'').toLowerCase().includes(query.toLowerCase()) || (n.message||'').toLowerCase().includes(query.toLowerCase())).length > pageSize && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min(notifications.length, (page)*pageSize)} of {notifications.filter(n => (n.title||'').toLowerCase().includes(query.toLowerCase()) || (n.message||'').toLowerCase().includes(query.toLowerCase())).length} broadcasts
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}>Previous</Button>
                <div className="px-3 py-1 bg-muted rounded text-sm">Page {page}</div>
                <Button size="sm" variant="outline" onClick={() => setPage(p => p+1)} disabled={page*pageSize >= notifications.filter(n => (n.title||'').toLowerCase().includes(query.toLowerCase()) || (n.message||'').toLowerCase().includes(query.toLowerCase())).length}>Next</Button>
              </div>
            </div>
          )}

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
