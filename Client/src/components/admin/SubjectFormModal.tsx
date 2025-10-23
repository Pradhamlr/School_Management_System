import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

type Props = { initial?: any | null; open: boolean; onOpenChange: (v:boolean)=>void; onSaved: ()=>void };

export default function SubjectFormModal({ initial, open, onOpenChange, onSaved }: Props){
  const { toast } = useToast();
  const form = useForm({ defaultValues: { name: initial?.name || '', code: initial?.code || '' } });

  useEffect(() => { form.reset({ name: initial?.name || '', code: initial?.code || '' }); }, [initial]);

  const onSubmit = async (values:any) => {
    try{
      if (initial && initial.id) {
        await api.put(`/api/subjects/${initial.id}`, values);
      } else {
        await api.post('/api/subjects', values);
      }
      toast({ title: 'Saved', description: 'Subject saved' });
      onSaved();
      onOpenChange(false);
    }catch(err:any){
      toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to save subject', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
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
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input {...form.register('code', { required: 'Code is required' })} />
              </FormControl>
              <FormMessage>{form.formState.errors.code?.message as string}</FormMessage>
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
