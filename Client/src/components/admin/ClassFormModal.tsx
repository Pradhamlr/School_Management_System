import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import api, { showApiError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

type Props = {
  initial?: any;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
};

export default function ClassFormModal({ initial, open, onOpenChange, onSaved }: Props) {
  const { toast } = useToast();
  const form = useForm({ defaultValues: { name: initial?.name || '', section: initial?.section || '' } });

  const onSubmit = async (values: any) => {
    try {
      if (initial && initial.id) {
        await api.patch(`/api/classes/${initial.id}`, values);
      } else {
        await api.post('/api/classes', values);
      }
      toast({ title: 'Saved', description: 'Class saved successfully' });
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      showApiError(toast, err, 'Failed to save class');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Class' : 'Add Class'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...form.register('name', { required: 'Name is required' })} />
              </FormControl>
              <FormMessage>{form.formState.errors.name?.message as string}</FormMessage>
            </FormItem>

            <FormItem>
              <FormLabel>Section</FormLabel>
              <FormControl>
                <Input {...form.register('section', { required: 'Section is required' })} />
              </FormControl>
              <FormMessage>{form.formState.errors.section?.message as string}</FormMessage>
            </FormItem>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
