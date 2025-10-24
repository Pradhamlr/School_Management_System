import React, { useEffect, useState } from 'react';
import { Search, Bell, Settings, User, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '@/lib/api';
import NotificationPreviewDialog from '@/components/admin/NotificationPreviewDialog';
import { timeAgo } from '@/lib/time';

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [selectedNotifId, setSelectedNotifId] = useState<number | null>(null);

  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await notificationAPI.getNotifications();
      setNotifications((res.data.data || []).slice(0, 6));
    } catch (e) {
      console.error('Failed to load notifications', e?.response?.status, e?.response?.data || e?.message || e);
    } finally {
      setNotifLoading(false);
    }
  };

  // Fetch when component mounts and whenever user changes
  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30_000);

    return () => clearInterval(interval);
  }, [user?.id, user?.role]);

  const handleLogout = () => { logout(); navigate('/'); };

  // Route 'View all' based on user role (teacher should use /teacher/notifications)
  const viewAllRoute = user?.role === 'ADMIN' ? '/admin/notifications' : (user?.role === 'TEACHER' ? '/teacher/notifications' : '/student/notifications');

  return (
    <header className="h-20 glass-card border-b border-border/50 px-8 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-10 bg-background/50 border-border/50 backdrop-blur-sm" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {notifLoading ? (
                <span className="absolute -top-2 -right-2 w-4 h-4 animate-pulse rounded-full bg-yellow-400" />
              ) : notifications.length > 0 ? (
                <span className="absolute -top-2 -right-2 min-w-[18px] h-4 bg-red-600 text-white rounded-full text-[11px] leading-4 flex items-center justify-center px-1">{notifications.length > 99 ? '99+' : notifications.length}</span>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[520px]">
            <div className="p-3">
              <div className="flex items-center justify-between px-1 pb-2">
                <div className="font-medium">Notifications</div>
                <div className="text-xs text-muted-foreground">{notifLoading ? 'Loading…' : `${notifications.length} recent`}</div>
              </div>
              <div className="space-y-1 max-h-64 overflow-auto">
                {notifLoading ? (
                  <div className="p-2 text-sm text-muted-foreground">Loading…</div>
                ) : notifications.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-2 rounded-md hover:bg-muted/50 cursor-pointer flex items-start gap-3" onClick={() => setSelectedNotifId(n.id)}>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{n.title}</div>
                        <div className="text-xs text-muted-foreground truncate line-clamp-2">{n.message}</div>
                      </div>
                      <div className="text-xs text-muted-foreground flex-shrink-0 ml-2">{timeAgo(n.createdAt)}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="pt-3 border-t mt-3 flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => navigate(viewAllRoute)}>View all</Button>
                <Button variant="outline" size="sm" onClick={() => fetchNotifications()}>Refresh</Button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {user?.role === 'ADMIN' && (
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/settings')}>
            <Settings className="w-5 h-5" />
          </Button>
        )}

        <div className="flex items-center gap-3 pl-4 border-l border-border/50">
          <NotificationPreviewDialog id={selectedNotifId} open={Boolean(selectedNotifId)} onOpenChange={(v) => { if (!v) setSelectedNotifId(null); }} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 p-2">
                <Avatar>
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="bg-primary text-white">
                    {user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.role || 'Role'}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}