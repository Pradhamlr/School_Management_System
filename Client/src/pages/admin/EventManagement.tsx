import React, { useEffect, useState } from 'react';
import AdminSidebar from "@/components/AdminSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import EventFormModal from '../../components/admin/EventFormModal';
import { timeAgo } from '@/lib/time';
import api from '@/lib/api';

export default function EventManagement() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/events');
      setEvents(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const onSaved = () => { setOpenForm(false); setEditing(null); fetchEvents(); };
  const handleEdit = (ev: any) => { setEditing(ev); setOpenForm(true); };
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this event?')) return;
    try { await api.delete(`/api/events/${id}`); fetchEvents(); } catch (e) { console.error(e); }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />
      <div className="flex-1">
        <DashboardHeader />
  <main className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
              <p className="text-gray-600 mt-1">Manage school events and activities</p>
            </div>
            <div>
              <Button size="sm" onClick={() => { setEditing(null); setOpenForm(true); }}>Create Event</Button>
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>When</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Volunteers</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6}>Loading…</TableCell></TableRow>
                ) : events.length === 0 ? (
                  <TableRow><TableCell colSpan={6}>No events yet</TableCell></TableRow>
                ) : events.map(ev => (
                  <TableRow key={ev.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">{ev.title}</TableCell>
                    <TableCell>{new Date(ev.startDate).toLocaleString()} • {timeAgo(ev.startDate)}</TableCell>
                    <TableCell>{ev.location || '-'}</TableCell>
                    <TableCell>{ev.teacher?.user?.name || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 items-center">
                        {(!ev.volunteers || (ev.volunteers || []).length === 0) ? (
                          <div className="text-sm text-muted-foreground">No volunteers</div>
                        ) : (
                          <>
                            {(ev.volunteers || []).slice(0,3).map((v:any) => (
                              <div key={v.id} className="flex items-center gap-2 bg-muted rounded-full px-2 py-1 text-sm">
                                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center">{(v.student?.user?.name||'').split(' ').map((n:string)=>n[0]).join('')}</div>
                                <span>{v.student?.user?.name || `Student ${v.student?.id || v.id}`}</span>
                              </div>
                            ))}
                            {(ev.volunteers || []).length > 3 && <span className="text-sm text-muted-foreground">+{(ev.volunteers || []).length-3} more</span>}
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(ev)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(ev.id)}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <EventFormModal open={openForm} onOpenChange={(v)=>{ if(!v){ setEditing(null); setOpenForm(false);} else setOpenForm(true); }} event={editing} onSaved={onSaved} />
        </main>
      </div>
    </div>
  );
}