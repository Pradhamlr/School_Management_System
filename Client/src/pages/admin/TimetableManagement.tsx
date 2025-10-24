import React, { useEffect, useMemo, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import TimetableFormModal from '@/components/admin/TimetableFormModal';
import api, { showApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Calendar, List } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const TimetableManagement = () => {
  const [timetables, setTimetables] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [classFilter, setClassFilter] = useState<string | ''>('');
  const [teacherFilter, setTeacherFilter] = useState<string | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');
  const [initialData, setInitialData] = useState<any>(undefined);
  const { toast } = useToast();

  const fetchTimetables = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/timetables');
      const items = res.data.data || res.data || [];
      setTimetables(items);
      // default to first class (focus) instead of using a generic "all" view
      if (!classFilter) {
        const firstClass = items.find((it: any) => it.class && it.class.id);
        if (firstClass) setClassFilter(String(firstClass.class.id));
      }
    } catch (err: any) {
      showApiError(toast, err, 'Failed to load timetables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTimetables(); }, []);

  const handleSaved = () => { fetchTimetables(); };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this timetable slot?')) return;
    try {
      await api.delete(`/api/timetables/${id}`);
      toast({ title: 'Deleted', description: 'Timetable slot removed' });
      fetchTimetables();
    } catch (err: any) {
      showApiError(toast, err, 'Failed to delete');
    }
  };

  // Helper: day ordering and grouping
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  function dayIndex(day?: string) {
    if (!day) return 7;
    const idx = dayOrder.findIndex(d => d.toLowerCase() === String(day).toLowerCase());
    return idx === -1 ? 7 : idx;
  }

  function groupByClass(slots: any[]) {
    const map: Record<string, any> = {};
    for (const s of slots) {
      const cid = s.class?.id ? String(s.class.id) : 'unassigned';
      if (!map[cid]) {
        map[cid] = {
          classId: cid,
          className: s.class?.name || 'Unassigned',
          classSection: s.class?.section || '',
          classTeacher: s.teacher?.user?.name || '',
          slots: []
        };
      }
      map[cid].slots.push(s);
    }
    return map;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Timetable Management</h1>
            <div className="flex gap-2">
              <div className="flex items-center gap-3">
                <Select value={String(classFilter)} onValueChange={(v) => setClassFilter(v)}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(new Map(timetables.map(t => [t.class?.id, t.class]))).map(([id, cls]: any) => (
                      cls ? <SelectItem key={id} value={String(id)}>{cls.name}{cls.section ? ` - ${cls.section}` : ''}</SelectItem> : null
                    ))}
                  </SelectContent>
                </Select>

                <Select value={String(teacherFilter)} onValueChange={(v) => setTeacherFilter(v === 'all' ? 'all' : v)}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="All teachers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All teachers</SelectItem>
                    {Array.from(new Map(timetables.map(t => [t.teacher?.id, t.teacher]))).map(([id, teacher]: any) => (
                      teacher ? <SelectItem key={id} value={String(id)}>{teacher.user?.name}</SelectItem> : null
                    ))}
                  </SelectContent>
                </Select>

                <div className="inline-flex bg-slate-100 rounded-md p-1" role="tablist" aria-label="View mode">
                  <button
                    role="tab"
                    aria-selected={viewMode === 'grouped'}
                    onClick={() => setViewMode('grouped')}
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded ${viewMode === 'grouped' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Week</span>
                  </button>
                  <button
                    role="tab"
                    aria-selected={viewMode === 'list'}
                    onClick={() => setViewMode('list')}
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <List className="w-4 h-4" />
                    <span className="text-sm">List</span>
                  </button>
                </div>

                <Button onClick={() => { setInitialData({ classId: classFilter !== 'all' ? Number(classFilter) : undefined, teacherId: teacherFilter !== 'all' ? Number(teacherFilter) : undefined }); setOpen(true); }}>Add Slot</Button>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All timetable slots</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <div>Loading...</div> : (
                <div className="space-y-3">
                  {viewMode === 'list' && (
                    <div className="space-y-3">
                      {timetables
                        .filter(t => (classFilter === 'all' || String(t.class?.id) === String(classFilter)) && (teacherFilter === 'all' || String(t.teacher?.id) === String(teacherFilter)))
                        .sort((a, b) => (dayIndex(a.day) - dayIndex(b.day)) || a.startMinute - b.startMinute)
                        .map((t) => (
                          <div key={t.id} className="p-3 rounded-md bg-white shadow-sm flex items-center justify-between">
                            <div>
                              <div className="font-semibold">{t.subject?.name} — {t.class?.name} {t.class?.section ? `- ${t.class.section}` : ''}</div>
                              <div className="text-sm text-muted-foreground">{t.day} • {formatTime(t.startMinute)} - {formatTime(t.endMinute)} • {t.teacher?.user?.name} • {t.classroom?.name}</div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" onClick={() => alert('Edit not implemented yet')}>Edit</Button>
                              <Button variant="destructive" onClick={() => handleDelete(t.id)}>Delete</Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {viewMode === 'grouped' && (
                    // Week-grid calendar view
                    (() => {
                      // grid settings (7:00 - 19:00)
                      const GRID_START = 7 * 60;
                      const GRID_END = 19 * 60;
                      const GRID_RANGE = GRID_END - GRID_START;
                      const GRID_HEIGHT = 720; // px

                      const days = dayOrder;

                      // derived maps for small contextual placeholders
                      const classesMap = new Map(timetables.map(t => [t.class?.id, t.class]));
                      const selectedClass = classFilter ? classesMap.get(Number(classFilter)) : null;
                      const teachersMap = new Map(timetables.map(t => [t.teacher?.id, t.teacher]));
                      const selectedTeacher = teacherFilter && teacherFilter !== 'all' ? teachersMap.get(Number(teacherFilter)) : null;

                      // Deterministic color palette for subjects
                      const subjectsUnique = Array.from(new Map(timetables.map(t => [t.subject?.id, t.subject]))).map(([, s]: any) => s).filter(Boolean);
                      const palette = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6'];
                      const hashToIndex = (subject: any) => {
                        const key = String(subject?.id ?? subject?.name ?? '');
                        let h = 0;
                        for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
                        return Math.abs(h) % palette.length;
                      };
                      const subjectColor = (subject: any) => subject ? palette[hashToIndex(subject)] : '#6366F1';

                      const slotsByDay = days.map((d) => timetables
                        .filter(t => String(t.day).toLowerCase().startsWith(d.slice(0,3).toLowerCase()))
                        .filter(t => (classFilter === '' || String(t.class?.id) === String(classFilter)) && (teacherFilter === 'all' || String(t.teacher?.id) === String(teacherFilter)))
                        .sort((a,b) => a.startMinute - b.startMinute)
                      );

                      function onColumnClick(day: string, e: React.MouseEvent) {
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        const y = e.clientY - rect.top;
                        const minute = Math.round(((y / GRID_HEIGHT) * GRID_RANGE + GRID_START) / 30) * 30;
                        const start = Math.max(GRID_START, Math.min(minute, GRID_END - 30));
                        setInitialData({ classId: classFilter !== 'all' ? Number(classFilter) : undefined, teacherId: teacherFilter !== 'all' ? Number(teacherFilter) : undefined, day, startMinute: start, endMinute: start + 60 });
                        setOpen(true);
                      }

                      return (
                        <div>
                          <div className="flex items-center justify-between gap-4 mb-3">
                            <div className="text-sm text-muted-foreground">Click a column to add a slot at that time.</div>
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium">Legend</div>
                              <div className="flex gap-2 items-center overflow-x-auto">
                                {subjectsUnique.slice(0,12).map((s: any) => (
                                  <div key={s.id} className="flex items-center gap-2 text-xs rounded px-2 py-1 bg-white/80 border" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                                    <span className="w-3 h-3 rounded-full" style={{ background: subjectColor(s) }} />
                                    <div className="font-medium text-xs">{s.name}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {/* time gutter */}
                            <div className="w-14 hidden md:block">
                              <div className="h-8" />
                              {(() => {
                                const TICK = 30;
                                const ticks = Math.floor(GRID_RANGE / TICK);
                                return Array.from({ length: ticks }).map((_, i) => {
                                  const minute = GRID_START + i * TICK;
                                  const h = (TICK / GRID_RANGE) * GRID_HEIGHT;
                                  return (
                                    <div key={i} className="text-xs text-muted-foreground" style={{ height: `${h}px` }}>
                                      {minute % 60 === 0 ? formatTime(minute) : ''}
                                    </div>
                                  );
                                });
                              })()}
                            </div>

                            <div className="overflow-x-auto w-full">
                              <div className="grid grid-cols-5 gap-2 min-w-[700px]">
                                {days.map((d, idx) => (
                                  <div key={d} className="bg-white/80 rounded border border-border">
                                    <div className="p-2 border-b text-sm font-medium">{d}</div>
                                    <div className="relative" style={{ height: GRID_HEIGHT }} onClick={(e) => onColumnClick(d, e)}>
                                      {/* time background ticks (30-minute) */}
                                      {(() => {
                                        const TICK = 30;
                                        const ticks = Math.floor(GRID_RANGE / TICK);
                                        return Array.from({ length: ticks }).map((_, i) => (
                                          <div key={i} style={{ position: 'absolute', top: `${(i * TICK / GRID_RANGE) * GRID_HEIGHT}px`, left: 0, right: 0, height: `${(TICK / GRID_RANGE) * GRID_HEIGHT}px`, borderTop: i % (60 / TICK) === 0 ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(0,0,0,0.03)' }} />
                                        ));
                                      })()}

                                        {slotsByDay[idx].length === 0 && (
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-[90%] h-[70%] border-2 border-dashed rounded-md bg-white/60 cursor-pointer flex flex-col items-center justify-center gap-1" onClick={(e) => onColumnClick(d, e as any)}>
                                              <div className="font-medium text-sm text-slate-700">No slots</div>
                                              <div className="text-xs text-muted-foreground">Click here to add a slot at this time</div>
                                              <div className="mt-2 text-xs text-muted-foreground">Class: {selectedClass ? `${selectedClass.name}${selectedClass.section ? ` - ${selectedClass.section}` : ''}` : 'All classes'}</div>
                                              <div className="text-xs text-muted-foreground">Teacher: {selectedTeacher ? (selectedTeacher.user?.name || selectedTeacher.name) : 'Any'}</div>
                                            </div>
                                          </div>
                                        )}

                                        {slotsByDay[idx].map((s: any) => {
                                        const start = Math.max(GRID_START, Math.min(s.startMinute, GRID_END));
                                        const end = Math.max(GRID_START, Math.min(s.endMinute, GRID_END));
                                        const top = ((start - GRID_START) / GRID_RANGE) * GRID_HEIGHT;
                                        const height = Math.max(20, ((end - start) / GRID_RANGE) * GRID_HEIGHT);
                                        const bg = subjectColor(s.subject);
                                        return (
                                          <div key={s.id} className="absolute left-2 right-2 rounded-md p-2 text-xs text-white flex flex-col justify-between shadow" style={{ top, height, background: bg, overflow: 'hidden' }}>
                                            <div>
                                              <div className="font-medium">{s.subject?.name} <span className="text-[11px] opacity-90">• {s.class?.name}{s.class?.section ? `-${s.class.section}` : ''}</span></div>
                                              <div className="text-[11px] opacity-90">{formatTime(s.startMinute)} - {formatTime(s.endMinute)} • {s.classroom?.name || 'Room N/A'}</div>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                              <div className="text-[11px] opacity-90">{s.teacher?.user?.name}</div>
                                              <div className="flex gap-1">
                                                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setInitialData(s); setOpen(true); }}>
                                                  Edit
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <TimetableFormModal
            initial={initialData}
            timetables={timetables}
            open={open}
            onOpenChange={(v) => { setOpen(v); if (!v) setInitialData(undefined); }}
            onSaved={() => { handleSaved(); setInitialData(undefined); }}
          />
        </main>
      </div>
    </div>
  );

  function formatTime(minutes: number) {
    if (typeof minutes !== 'number') return '';
    const hh = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mm = (minutes % 60).toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }
};

export default TimetableManagement;
