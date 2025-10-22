import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

type Props = { subject?: any; open: boolean; onOpenChange: (v:boolean)=>void; onSaved: ()=>void };

export default function SubjectAssignModal({ subject, open, onOpenChange, onSaved }: Props){
  const { toast } = useToast();
  const form = useForm({ defaultValues: { teacherId: '', classId: '' } });

  const [teachers, setTeachers] = React.useState<any[]>([]);
  const [classes, setClasses] = React.useState<any[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = React.useState<string | null>(null);

  useEffect(()=>{ const load = async ()=>{
    try{
      const api = await import('@/lib/api').then(m=>m.default);
      const [tRes, cRes] = await Promise.all([api.get('/api/teachers'), api.get('/api/classes')]);
      setTeachers(tRes.data.teachers || []);
      setClasses(cRes.data.classes || []);
    }catch(e){console.error(e)} };
    if(open) load();
  }, [open]);

  const onSubmit = async (values:any) => {
    try{
      const api = await import('@/lib/api').then(m=>m.default);
      const teacherId = selectedTeacherId ? Number(selectedTeacherId) : (values.teacherId ? Number(values.teacherId) : null);
      const classId = selectedClassId ? Number(selectedClassId) : (values.classId ? Number(values.classId) : null);
      if (!teacherId || !classId) throw new Error('Select both teacher and class');
      await api.post('/api/subjects/assign', { teacherId, classId, subjectId: subject.id });
      toast({ title: 'Assigned', description: 'Teacher assigned to subject' });
      // notify other parts of the app (e.g., teacher list) that assignments changed
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('subject-assigned', { detail: { subjectId: subject.id, teacherId, classId } }));
      }
      onSaved();
      onOpenChange(false);
    }catch(err:any){
      toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to assign', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign "{subject?.name || 'Subject'}"</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
            <FormItem>
              <FormLabel>Teacher</FormLabel>
              <FormControl>
                <Select onValueChange={(val)=>setSelectedTeacherId(val)} value={selectedTeacherId ?? ''}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map(t=> <SelectItem key={t.id} value={String(t.id)}>{t.user?.name || t.user?.email || `Teacher ${t.id}`}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage>{form.formState.errors.teacherId?.message as string}</FormMessage>
            </FormItem>

            <FormItem>
              <FormLabel>Class</FormLabel>
              <FormControl>
                <Select onValueChange={(val)=>setSelectedClassId(val)} value={selectedClassId ?? ''}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(c=> <SelectItem key={c.id} value={String(c.id)}>{c.name}{c.section ? ` - ${c.section}` : ''}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage>{form.formState.errors.classId?.message as string}</FormMessage>
            </FormItem>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Assign</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
