import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { timeAgo } from '@/lib/time';
import api from '@/lib/api';

type Props = {
  id: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function NotificationPreviewDialog({ id, open, onOpenChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState<any | null>(null);

  useEffect(() => {
    if (!id || !open) return;
    let mounted = true;
      const fetchOne = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/notifications/${id}`);
        if (!mounted) return;
        setNotif(res.data.data || null);
      } catch (e) {
        console.error('Failed to fetch notification', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchOne();
    return () => { mounted = false; };
  }, [id, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Enforce a centered modal with a fixed, comfortable width and remove slide animations */}
      <DialogContent className="sm:max-w-md w-[520px]" style={{ animation: 'none', transform: 'none' }}>
        <DialogHeader>
          <DialogTitle className="break-words">{loading ? 'Loading…' : notif?.title || 'Notification'}</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <p className="text-sm text-muted-foreground mb-2">{notif ? timeAgo(notif.createdAt) : ''}</p>
          <div className="prose max-w-none break-words">
            {notif?.message}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
