import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Form, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import api from '@/lib/api';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any | null;
  onSaved: () => void;
};

export default function EventFormModal({ open, onOpenChange, event, onSaved }: Props) {
  const { toast } = useToast();
  type FormValues = {
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    location?: string;
    teacherId: string;
    volunteerIds?: string[];
  };

  const form = useForm<FormValues>({ defaultValues: {
    title: event?.title || '',
    description: event?.description || '',
    startDate: event?.startDate ? new Date(event.startDate).toISOString().slice(0,16) : '',
    endDate: event?.endDate ? new Date(event.endDate).toISOString().slice(0,16) : '',
    location: event?.location || '',
    teacherId: event?.teacher?.id ? String(event.teacher.id) : event?.teacherId ? String(event.teacherId) : 'none',
    // Use the student id for volunteerIds (event.volunteers contains join rows)
    volunteerIds: event?.volunteers ? event.volunteers.map((v:any)=>String(v.student?.id ?? v.studentId ?? v.id)) : []
  }});

  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [volunteerQuery, setVolunteerQuery] = useState('');
  const [keyboardIndex, setKeyboardIndex] = useState(-1);
  const watchedVolunteerIds = form.watch('volunteerIds') || [];

  useEffect(() => {
    form.reset({
      title: event?.title || '',
      description: event?.description || '',
      startDate: event?.startDate ? new Date(event.startDate).toISOString().slice(0,16) : '',
      endDate: event?.endDate ? new Date(event.endDate).toISOString().slice(0,16) : '',
      location: event?.location || '',
      teacherId: event?.teacher?.id ? String(event.teacher.id) : event?.teacherId ? String(event.teacherId) : 'none',
      volunteerIds: event?.volunteers ? event.volunteers.map((v:any)=>String(v.student?.id ?? v.studentId ?? v.id)) : []
    });
  }, [event, open]);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await api.get('/api/teachers');
        const list = res.data.data || res.data.teachers || [];
        // If event has an assigned teacher id but it's not in the fetched list, append a lightweight placeholder so Select can display it
        const assignedId = event?.teacher?.id ?? event?.teacherId;
        if (assignedId && !list.some((t:any)=>String(t.id) === String(assignedId))) {
          const placeholderTeacher:any = event?.teacher ? { id: assignedId, user: event.teacher.user, name: event.teacher.name } : { id: assignedId, user: { name: `Teacher ${assignedId}` } };
          setTeachers([...list, placeholderTeacher]);
        } else {
          setTeachers(list);
        }
      } catch (e) { console.error(e); }
    };
    fetchTeachers();

    // also fetch students as potential volunteers (fallback: client-side filter)
    const fetchStudents = async () => {
      try {
        const res = await api.get('/api/students');
        const list = res.data.students || res.data.data || [];
        // If the event has assigned volunteers (join rows), ensure their student records are present so names render
        const assignedStudentIds = (event?.volunteers || []).map((v:any)=>Number(v.student?.id ?? v.studentId ?? v.id));
        const missing = assignedStudentIds.filter((id:any)=>id && !list.some((s:any)=>Number(s.id) === Number(id)));
        if (missing.length > 0) {
          // Create lightweight placeholders for missing students using available event data
          const placeholders = (event?.volunteers || []).map((v:any) => {
            const sid = Number(v.student?.id ?? v.studentId ?? v.id);
            if (!sid || !missing.includes(sid)) return null;
            return { id: sid, user: v.student?.user || { name: `Student ${sid}` }, name: v.student?.user?.name || v.student?.name };
          }).filter(Boolean);
          setStudents([...list, ...placeholders]);
        } else {
          setStudents(list);
        }
      } catch (e) { console.error(e); }
    };
    fetchStudents();
  }, []);

  const onSubmit = async (values: any) => {
    if (!values.title || !values.startDate || !values.endDate) { toast({ title: 'Validation', description: 'Title and dates are required', variant: 'destructive' }); return; }
  try {
      const payload = {
        title: values.title,
        description: values.description || null,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
        location: values.location || null,
        teacherId: values.teacherId && values.teacherId !== 'none' ? Number(values.teacherId) : null,
        volunteerIds: Array.isArray(values.volunteerIds) ? values.volunteerIds.filter(Boolean).map((v:any)=>Number(v)) : []
      };
      if (event && event.id) {
        await api.put(`/api/events/${event.id}`, payload);
      } else {
        await api.post('/api/events', payload);
      }
      toast({ title: 'Saved', description: 'Event saved successfully' });
      onSaved();
      onOpenChange(false);
    } catch (err:any) {
      console.error(err);
      toast({ title: 'Error', description: err?.response?.data?.message || 'Failed to save event', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent aria-describedby="event-dialog-desc" className="sm:max-w-2xl w-full max-h-[80vh] overflow-auto">
        <DialogHeader className="pb-0">
          <DialogTitle className="text-lg font-semibold">{event ? 'Edit Event' : 'Create Event'}</DialogTitle>
          <DialogDescription id="event-dialog-desc" className="text-sm text-muted-foreground">Create or edit school events — fill required fields and save.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...form.register('title', { required: true })} />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea {...form.register('description')} className="w-full rounded-md border p-3 h-20 max-h-40 resize-y placeholder:italic" placeholder="Brief description (optional)" />
              </FormControl>
              <FormMessage />
            </FormItem>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormItem>
                <FormLabel>Start</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...form.register('startDate', { required: true })} />
                </FormControl>
                <FormMessage />
              </FormItem>
              <FormItem>
                <FormLabel>End</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...form.register('endDate', { required: true })} />
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>

            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...form.register('location')} placeholder="e.g., Main Hall, Room 101" />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem>
              <FormLabel>Assign Teacher</FormLabel>
              <FormControl>
                <Select value={form.watch('teacherId')} onValueChange={(v)=>form.setValue('teacherId', v)}>
                  <SelectTrigger>
                      <SelectValue placeholder={teachers.length ? "Select teacher" : "No teachers available"} />
                    </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {teachers.length === 0 && (
                      <SelectItem value="none" disabled>
                        No teachers available
                      </SelectItem>
                    )}
                    {teachers.map(t => (
                      <SelectItem key={t.id} value={String(t.id)}>{t.user?.name || t.name || `Teacher ${t.id}`}</SelectItem>
                    ))}
                    {event?.teacher && !teachers.some((x:any)=>String(x.id) === String(event.teacher.id)) && (
                      <SelectItem key={`assigned-${event.teacher.id}`} value={String(event.teacher.id)}>{event.teacher.user?.name || event.teacher.name || `Teacher ${event.teacher.id}`}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
              {teachers.length === 0 && (
                <div className="text-sm text-muted-foreground mt-2">No teachers found. Add teachers first to assign one to this event.</div>
              )}
            </FormItem>

            <FormItem>
              <FormLabel>Volunteers</FormLabel>
              <FormControl>
                <div className="flex flex-col">
                  {/* Selected volunteers badges or empty state */}
                  <div className="mb-2">
                    {watchedVolunteerIds.filter(Boolean).length === 0 ? (
                      <div className="border border-dashed rounded p-3 text-sm text-muted-foreground">No volunteers selected. Use the search box below to add volunteers to this event.</div>
                    ) : (
                      <div className="flex gap-2 items-center flex-wrap">
                        {watchedVolunteerIds.filter(Boolean).map((id:any) => {
                          const s = students.find(st => String(st.id) === String(id));
                          return s ? (
                            <div key={id} className="flex items-center gap-2 bg-white border rounded-full px-2 py-1 shadow-sm text-sm">
                              <Avatar className="h-6 w-6">
                                {s.user?.avatar ? <AvatarImage src={s.user.avatar} alt={s.user.name} /> : <AvatarFallback className="text-xs">{(s.user?.name||s.name||'').split(' ').map((n:string)=>n[0]).join('')}</AvatarFallback>}
                              </Avatar>
                              <span className="text-sm">{s.user?.name || s.name || `Student ${id}`}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  {/* If there are no students loaded at all show prominent placeholder */}
                  {students.length === 0 ? (
                    <div className="p-3 rounded bg-gray-50 border text-sm text-muted-foreground">No students available to assign as volunteers. Add students first or check your student sync.</div>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            {(form.getValues('volunteerIds') || []).filter(Boolean).length === 0 ? (
                              <span className="text-sm text-muted-foreground">Select volunteers</span>
                            ) : (
                              <div className="flex items-center gap-2 flex-wrap">
                                {watchedVolunteerIds.filter(Boolean).slice(0,3).map((id:any) => {
                                      const s = students.find(st => String(st.id) === String(id));
                                  return s ? (
                                    <div key={id} className="flex items-center gap-2 bg-white border rounded-full px-2 py-0.5 shadow-sm text-sm">
                                      <Avatar className="h-5 w-5">
                                        {s.user?.avatar ? <AvatarImage src={s.user.avatar} alt={s.user.name} /> : <AvatarFallback className="text-xs">{(s.user?.name||s.name||'').split(' ').map((n:string)=>n[0]).join('')}</AvatarFallback>}
                                      </Avatar>
                                    </div>
                                  ) : null;
                                })}
                                    {watchedVolunteerIds.filter(Boolean).length > 3 && <span className="text-xs text-muted-foreground">+{watchedVolunteerIds.filter(Boolean).length - 3}</span>}
                              </div>
                            )}
                          </div>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[420px] max-h-[48vh] overflow-auto p-2">
                        <div className="mb-2">
                          <Input placeholder="Filter students..." value={volunteerQuery} onChange={(e)=>{ setVolunteerQuery(e.target.value); setKeyboardIndex(-1); }} />
                        </div>
                        <div>
                          {(() => {
                            const filtered = students.filter(s => {
                              if (!volunteerQuery) return true;
                              const name = (s.user?.name || s.name || '').toLowerCase();
                              return name.includes(volunteerQuery.toLowerCase());
                            }).slice(0,200);
                            if (filtered.length === 0) return <div className="text-sm text-muted-foreground">No volunteers match your search</div>;
                            return filtered.map((s, idx) => (
                              <DropdownMenuCheckboxItem key={s.id} checked={watchedVolunteerIds.some((v:any)=>String(v)===String(s.id))} onCheckedChange={(checked:boolean)=>{
                                const cur = Array.isArray(watchedVolunteerIds) ? [...watchedVolunteerIds] : [];
                                if (checked) {
                                  if (!cur.some((v:any)=>String(v)===String(s.id))) cur.push(String(s.id));
                                } else {
                                  const i = cur.findIndex((v:any)=>String(v)===String(s.id)); if (i>=0) cur.splice(i,1);
                                }
                                form.setValue('volunteerIds', cur);
                              }}>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-6 w-6">
                                    {s.user?.avatar ? <AvatarImage src={s.user.avatar} alt={s.user.name} /> : <AvatarFallback>{(s.user?.name||s.name||'').split(' ').map((n:string)=>n[0]).join('')}</AvatarFallback>}
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{s.user?.name || s.name || `Student ${s.id}`}</div>
                                    <div className="text-xs text-muted-foreground">{s.user?.email || ''}</div>
                                  </div>
                                </div>
                              </DropdownMenuCheckboxItem>
                            ));
                          })()}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                </div>
              </FormControl>
              <FormMessage />
            </FormItem>

            <DialogFooter className="pt-0">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" className="ml-2">{event ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
