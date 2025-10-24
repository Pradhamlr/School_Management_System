import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';
import { Lock, Unlock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Props = {
  initial?: any;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
  timetables?: any[];
};

export default function TimetableFormModal({ initial, open, onOpenChange, onSaved, timetables }: Props) {
  const { toast } = useToast();
  const form = useForm({ defaultValues: {
    classId: initial?.classId ?? '',
    subjectId: initial?.subjectId ?? '',
    teacherId: initial?.teacherId ?? '',
    classroomId: initial?.classroomId ?? '',
    // normalize day to short enum (MON/TUE/...)
    day: initial?.day ? String(initial.day).slice(0,3).toUpperCase() : 'MON',
    startTime: initial ? minutesToTime(initial.startMinute) : '08:00',
    endTime: initial ? minutesToTime(initial.endMinute) : '09:00'
  }});

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [lockClass, setLockClass] = useState(false);
  const [lockTeacher, setLockTeacher] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const [cRes, sRes, tRes, ttRes] = await Promise.all([
          api.get('/api/classes'),
          api.get('/api/subjects'),
          api.get('/api/teachers'),
          api.get('/api/timetables')
        ]);

        // helper to normalize various backend response shapes into an array
        const normalize = (res: any, keys: string[] = []) => {
          if (!res) return [];
          const d = res.data ?? res;
          // check standard keys first
          for (const k of keys) {
            if (d && Array.isArray(d[k])) return d[k];
          }
          // check common data holders
          if (d && Array.isArray(d.data)) return d.data;
          if (Array.isArray(d)) return d;
          // some controllers respond with { classes: [...] } or { subjects: [...] }
          const arrKey = Object.keys(d || {}).find(k => Array.isArray(d[k]));
          if (arrKey) return d[arrKey];
          return [];
        };

        const classesArr = normalize(cRes, ['classes']);
        const subjectsArr = normalize(sRes, ['subjects']);
        const teachersArr = normalize(tRes, ['teachers']);
        const timetablesArr = normalize(ttRes, ['data', 'timetables']);

        setClasses(classesArr);
        setSubjects(subjectsArr);
        setTeachers(teachersArr);

        // derive unique classrooms from existing timetables (some timetables include classroom)
        const seen = new Map();
        for (const item of timetablesArr) {
          if (item.classroom && item.classroom.id && !seen.has(item.classroom.id)) {
            seen.set(item.classroom.id, item.classroom);
          }
        }
        setClassrooms(Array.from(seen.values()));
      } catch (err: any) {
        toast({ title: 'Error', description: 'Failed to load select options', variant: 'destructive' });
      }
    })();
  }, [open]);

  // Reset form when modal opens or the initial prop changes so prefill works
  useEffect(() => {
    if (!open) return;
    const resetValues: any = {
      classId: initial?.classId ?? '',
      subjectId: initial?.subjectId ?? '',
      teacherId: initial?.teacherId ?? '',
      classroomId: initial?.classroomId ?? '',
      day: initial?.day ? String(initial.day).slice(0,3).toUpperCase() : 'MON',
      startTime: initial && typeof initial.startMinute === 'number' ? minutesToTime(initial.startMinute) : (initial?.startTime ?? '08:00'),
      endTime: initial && typeof initial.endMinute === 'number' ? minutesToTime(initial.endMinute) : (initial?.endTime ?? '09:00')
    };
    try {
      form.reset(resetValues);
    } catch (e) {
      // ignore
    }
    // reset lock state and conflicts
    setLockClass(Boolean(initial?.classId));
    setLockTeacher(Boolean(initial?.teacherId));
  }, [open, initial]);

  function timeToMinutes(t: string) {
    const [hh, mm] = t.split(':').map(Number);
    return hh * 60 + mm;
  }

  function minutesToTime(m: number) {
    const hh = Math.floor(m / 60).toString().padStart(2, '0');
    const mm = (m % 60).toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }

  // (Client-side conflict preview removed to simplify UX)

  const onSubmit = async (values: any) => {
    try {
      // validate required selects
      if (!values.classId || !values.subjectId || !values.teacherId || !values.classroomId) {
        toast({ title: 'Validation', description: 'Select class, subject, teacher and classroom', variant: 'destructive' });
        return;
      }
      // Note: client-side conflict preview has been removed; server will enforce conflicts.

      const dayMap: Record<string,string> = { MONDAY: 'MON', TUESDAY: 'TUE', WEDNESDAY: 'WED', THURSDAY: 'THU', FRIDAY: 'FRI', SATURDAY: 'SAT', SUNDAY: 'SUN', MON: 'MON', TUE: 'TUE', WED: 'WED', THU: 'THU', FRI: 'FRI', SAT: 'SAT', SUN: 'SUN' };
      const mappedDay = dayMap[String(values.day).toUpperCase()] || String(values.day).toUpperCase();

      const payload = {
        classId: Number(values.classId),
        subjectId: Number(values.subjectId),
        teacherId: Number(values.teacherId),
        classroomId: Number(values.classroomId),
        day: mappedDay,
        startMinute: timeToMinutes(values.startTime),
        endMinute: timeToMinutes(values.endTime)
      };

      if (payload.startMinute >= payload.endMinute) {
        toast({ title: 'Validation', description: 'Start time must be before end time', variant: 'destructive' });
        return;
      }

      if (initial && initial.id) {
        await api.put(`/api/timetables/${initial.id}`, payload);
        toast({ title: 'Updated', description: 'Timetable slot updated' });
      } else {
        await api.post('/api/timetables', payload);
        toast({ title: 'Saved', description: 'Timetable slot created' });
      }
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to save timetable', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Timetable Slot' : 'Add Timetable Slot'}</DialogTitle>
          <DialogDescription id="timetable-dialog-desc" className="text-sm text-muted-foreground">Create or edit a timetable slot. Required fields must be filled before saving.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
            <FormItem>
              <FormLabel>Class</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Select onValueChange={(v) => { if (!lockClass) form.setValue('classId', v); }} value={String(form.watch('classId') ?? '')}>
                    <SelectTrigger disabled={lockClass}>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name} {c.section ? `- ${c.section}` : ''}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormControl>
                <button
                  type="button"
                  aria-pressed={lockClass}
                  title={lockClass ? 'Unlock class' : 'Lock class'}
                  onClick={() => setLockClass(!lockClass)}
                  className="inline-flex items-center justify-center p-1 rounded text-slate-600 hover:bg-slate-100/50 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  {lockClass ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
              </div>
              <FormMessage>{form.formState.errors.classId?.message as string}</FormMessage>
            </FormItem>

            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Select onValueChange={(v) => form.setValue('subjectId', v)} value={String(form.watch('subjectId') ?? '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage>{form.formState.errors.subjectId?.message as string}</FormMessage>
            </FormItem>

            <FormItem>
              <FormLabel>Teacher</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Select onValueChange={(v) => { if (!lockTeacher) form.setValue('teacherId', v); }} value={String(form.watch('teacherId') ?? '')}>
                    <SelectTrigger disabled={lockTeacher}>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.user?.name || t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormControl>
                <button
                  type="button"
                  aria-pressed={lockTeacher}
                  title={lockTeacher ? 'Unlock teacher' : 'Lock teacher'}
                  onClick={() => setLockTeacher(!lockTeacher)}
                  className="inline-flex items-center justify-center p-1 rounded text-slate-600 hover:bg-slate-100/50 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  {lockTeacher ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
              </div>
              <FormMessage>{form.formState.errors.teacherId?.message as string}</FormMessage>
            </FormItem>

            <FormItem>
              <FormLabel>Classroom</FormLabel>
              <FormControl>
                <Select onValueChange={(v) => form.setValue('classroomId', v)} value={String(form.watch('classroomId') ?? '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {classrooms.map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage>{form.formState.errors.classroomId?.message as string}</FormMessage>
            </FormItem>

            <FormItem>
              <FormLabel>Day</FormLabel>
              <FormControl>
                <Select onValueChange={(v) => form.setValue('day', v)} value={String(form.watch('day') ?? '')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MON">Monday</SelectItem>
                    <SelectItem value="TUE">Tuesday</SelectItem>
                    <SelectItem value="WED">Wednesday</SelectItem>
                    <SelectItem value="THU">Thursday</SelectItem>
                    <SelectItem value="FRI">Friday</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>

            <div className="grid grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Start Time (HH:MM)</FormLabel>
                <FormControl>
                  <Input {...form.register('startTime', { required: 'Start time required' })} />
                </FormControl>
                <FormMessage>{form.formState.errors.startTime?.message as string}</FormMessage>
              </FormItem>

              <FormItem>
                <FormLabel>End Time (HH:MM)</FormLabel>
                <FormControl>
                  <Input {...form.register('endTime', { required: 'End time required' })} />
                </FormControl>
                <FormMessage>{form.formState.errors.endTime?.message as string}</FormMessage>
              </FormItem>
            </div>

            {/* client-side conflict preview removed to simplify workflow; server validates overlaps */}

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
