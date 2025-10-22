import { Search, Bell, Settings, User, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
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
      const apiClient = await import('@/lib/api').then(m => m.default);
      const res = await apiClient.get('/api/notifications');
      setNotifications((res.data.data || []).slice(0, 6));
    } catch (e) {
      console.error('Failed to load notifications', e);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <header className="h-20 glass-card border-b border-border/50 px-8 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
      </div>

  <div className="flex items-center gap-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-background/50 border-border/50 backdrop-blur-sm"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[18px] h-4 bg-red-600 text-white rounded-full text-[11px] leading-4 flex items-center justify-center px-1">{notifications.length > 99 ? '99+' : notifications.length}</span>
              )}
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
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/notifications')}>View all</Button>
                <Button variant="outline" size="sm" onClick={() => fetchNotifications()}>Refresh</Button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </Button>

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
                  <p className="text-sm font-medium text-foreground">{user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.role || "Role"}</p>
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