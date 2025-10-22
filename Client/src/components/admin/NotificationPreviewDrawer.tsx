import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

type Props = { id: number | null; open: boolean; onOpenChange: (v: boolean) => void };

export default function NotificationPreviewDrawer({ id, open, onOpenChange }: Props){
  const [notification, setNotification] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open || !id) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try{
        const apiClient = await import('@/lib/api').then(m=>m.default);
        const res = await apiClient.get(`/api/notifications/${id}`);
        if (!mounted) return;
        setNotification(res.data.data || null);
      }catch(err:any){
        toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to load notification', variant: 'destructive' });
      }finally{ if (mounted) setLoading(false); }
    };
    load();
    return () => { mounted = false; };
  }, [id, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notification Preview</DialogTitle>
        </DialogHeader>
        <div className="p-2">
          {loading ? (
            <div>Loading…</div>
          ) : !notification ? (
            <div>No notification available</div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold">{notification.title}</h3>
              <p className="text-sm text-muted-foreground">Target: {notification.targetRole}</p>
              <div className="mt-4 p-4 border rounded bg-white">
                <div dangerouslySetInnerHTML={{ __html: notification.message }} />
              </div>
              {/* Email previews intentionally not shown in UI */}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
