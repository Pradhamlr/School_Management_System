import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

type Props = {
  open: boolean;
  onOpenChange: (v:boolean) => void;
  onSaved: () => void;
};

export default function NotificationFormModal({ open, onOpenChange, onSaved }: Props){
  const { toast } = useToast();
  const form = useForm({ defaultValues: { title: '', message: '', targetRole: 'STUDENT' } });

  const onSubmit = async (values:any) => {
    try{
      const apiClient = await import('@/lib/api').then(m => m.default);
      const res = await apiClient.post('/api/notifications', { title: values.title, message: values.message, targetRole: values.targetRole });
      toast({ title: 'Sent', description: 'Notification created and dispatched' });
      // Show email summary preview if present
      if (res?.data?.data?.emailSummary) {
        const total = res.data.data.emailSummary.totalRecipients;
        toast({ title: 'Email summary', description: `${total} recipients (preview available in backend)` });
      }
      onSaved();
      onOpenChange(false);
    }catch(err:any){
      console.error(err);
      toast({ title: 'Error', description: err?.response?.data?.message || err?.message || 'Failed to send notification', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Notification</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4 p-2" onSubmit={form.handleSubmit(onSubmit)}>
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...form.register('title', { required: true })} placeholder="Short title" />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <textarea {...form.register('message', { required: true })} className="w-full rounded-md border p-2" rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem>
              <FormLabel>Target Role</FormLabel>
              <FormControl>
                <Select onValueChange={(v) => form.setValue('targetRole', v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">STUDENT</SelectItem>
                    <SelectItem value="TEACHER">TEACHER</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Send</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
