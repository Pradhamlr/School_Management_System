import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import api, { showApiError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { emailRegex } from '@/lib/validation';

type Props = {
  initial?: any;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
};

export default function StudentFormModal({ initial, open, onOpenChange, onSaved }: Props) {
  const { toast } = useToast();
  const form = useForm({ defaultValues: {
    userId: initial?.userId ? String(initial.userId) : '',
    // user create fields
    name: '',
    email: '',
    password: '',
    rollNumber: initial?.rollNumber || '',
    classId: initial?.classId || '',
    dob: initial?.dob ? new Date(initial.dob).toISOString().slice(0,10) : ''
  }});

  const userIdValue = form.watch('userId');

  const onSubmit = async (values: any) => {
    try {
      let userId = values.userId;

      // If no userId provided but name/email/password present, create user first
      if (!userId) {
        if (!(values.email && values.password && values.name)) {
          throw new Error('Provide existing userId or name/email/password to create user');
        }
        const res = await api.post('/api/auth/signup', { name: values.name, email: values.email, password: values.password, role: 'STUDENT' });
        userId = res.data.user.id;
        toast({ title: 'User created', description: `Created user ${values.email}` });
      }

      const payload: any = {
        userId: userId ? Number(userId) : undefined,
        rollNumber: values.rollNumber || undefined,
        classId: values.classId ? Number(values.classId) : undefined,
        dob: values.dob || undefined
      };

      if (initial && initial.id) {
        await api.patch(`/api/students/${initial.id}`, payload);
      } else {
        await api.post('/api/students', payload);
      }

      toast({ title: 'Saved', description: 'Student saved successfully' });
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      showApiError(toast, err, 'Failed to save student');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Student' : 'Add Student'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
            <FormItem>
              <FormLabel>User ID (or create below)</FormLabel>
              <FormControl>
                <Input {...form.register('userId')} placeholder="Existing user id (leave empty to create)" />
              </FormControl>
              <FormMessage />
            </FormItem>

            {/* Only show create-user block when adding a new student (no initial) */}
            {!initial && (
              <div className="p-2 border rounded bg-gray-50">
                <p className="text-sm font-medium mb-2">If the student does not have a user account yet, create one here</p>
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...form.register('name', { validate: (v) => { return form.getValues('userId') || v ? true : 'Name is required when creating user' } })} />
                  </FormControl>
                  <FormMessage>{form.formState.errors.name?.message as string}</FormMessage>
                </FormItem>

                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...form.register('email', {
                      validate: (v) => {
                        if (form.getValues('userId')) return true;
                        if (!v) return 'Email is required when creating user';
                        return emailRegex.test(v) || 'Invalid email format';
                      }
                    })} type="email" />
                  </FormControl>
                  <FormMessage>{form.formState.errors.email?.message as string}</FormMessage>
                </FormItem>

                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...form.register('password', {
                      validate: (v) => {
                        if (form.getValues('userId')) return true;
                        if (!v) return 'Password is required when creating user';
                        return v.length >= 6 || 'Password must be at least 6 characters';
                      }
                    })} type="password" />
                  </FormControl>
                  <FormMessage>{form.formState.errors.password?.message as string}</FormMessage>
                </FormItem>
              </div>
            )}

            <FormItem>
              <FormLabel>Roll Number</FormLabel>
              <FormControl>
                <Input {...form.register('rollNumber', { required: 'Roll number is required' })} />
              </FormControl>
              <FormMessage>{form.formState.errors.rollNumber?.message as string}</FormMessage>
            </FormItem>

            <FormItem>
              <FormLabel>Class ID</FormLabel>
              <FormControl>
                <Input {...form.register('classId', { required: 'Class ID is required' })} />
              </FormControl>
              <FormMessage>{form.formState.errors.classId?.message as string}</FormMessage>
            </FormItem>

            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <Input type="date" {...form.register('dob')} />
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
