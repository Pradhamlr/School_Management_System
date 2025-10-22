import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

type Props = {
  initial?: any;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
};

export default function TeacherFormModal({ initial, open, onOpenChange, onSaved }: Props) {
  const { toast } = useToast();
  const form = useForm({ defaultValues: {
    userId: initial?.userId || '',
    name: '',
    email: '',
    password: '',
    department: initial?.department || '',
    hireDate: initial?.hireDate ? new Date(initial.hireDate).toISOString().slice(0,10) : ''
  }});

  const onSubmit = async (values: any) => {
    try {
      let userId = values.userId;
      if (!userId && values.email && values.password && values.name) {
        const res = await api.post('/api/auth/signup', { name: values.name, email: values.email, password: values.password, role: 'TEACHER' });
        userId = res.data.user.id;
        toast({ title: 'User created', description: `Created user ${values.email}` });
      }

      const payload: any = {
        userId: Number(userId),
        department: values.department || undefined,
        hireDate: values.hireDate || undefined
      };

      if (initial && initial.id) {
        await api.patch(`/api/teachers/${initial.id}`, payload);
      } else {
        await api.post('/api/teachers', payload);
      }

      toast({ title: 'Saved', description: 'Teacher saved successfully' });
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to save teacher', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Teacher' : 'Add Teacher'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
              <FormItem>
                <FormLabel>User ID</FormLabel>
                <FormControl>
                  <Input {...form.register('userId')} placeholder="Existing user id" />
                </FormControl>
                <FormMessage />
              </FormItem>

              {/* Only allow creating a user when adding a new teacher (no initial) */}
              {!initial && (
                <div className="p-2 border rounded bg-gray-50">
                  <p className="text-sm font-medium mb-2">If the teacher does not have a user account yet, create one here</p>
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...form.register('name', { required: 'Name is required when creating user' })} />
                    </FormControl>
                    <FormMessage>{form.formState.errors.name?.message as string}</FormMessage>
                  </FormItem>
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...form.register('email', { required: 'Email is required when creating user' })} type="email" />
                    </FormControl>
                    <FormMessage>{form.formState.errors.email?.message as string}</FormMessage>
                  </FormItem>
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...form.register('password', { required: 'Password required when creating user' })} type="password" />
                    </FormControl>
                    <FormMessage>{form.formState.errors.password?.message as string}</FormMessage>
                  </FormItem>
                </div>
              )}

            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Input {...form.register('department', { required: 'Department is required' })} />
              </FormControl>
              <FormMessage>{form.formState.errors.department?.message as string}</FormMessage>
            </FormItem>

            <FormItem>
              <FormLabel>Hire Date</FormLabel>
              <FormControl>
                <Input type="date" {...form.register('hireDate')} />
              </FormControl>
              <FormMessage />
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
