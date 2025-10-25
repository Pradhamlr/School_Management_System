import React, { useEffect, useState } from 'react';
import AdminSidebar from "@/components/AdminSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EventFormModal from '../../components/admin/EventFormModal';
import EventDetailsModal from '../../components/admin/EventDetailsModal';
import { timeAgo } from '@/lib/time';
import api from '@/lib/api';
import { Calendar, MapPin, Users, Clock, Plus, Edit, Trash2, Eye, Settings, X } from 'lucide-react';

export default function EventManagement() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);

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

  const upcomingEvents = events.filter(ev => new Date(ev.startDate) > new Date());
  const pastEvents = events.filter(ev => new Date(ev.startDate) <= new Date());

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event Timeline</h1>
              <p className="text-gray-600 mt-1">Organize and track school events chronologically</p>
            </div>
            <Button onClick={() => { setEditing(null); setOpenForm(true); }} className="bg-gradient-to-r from-emerald-600 to-emerald-700 gap-2">
              <Plus className="w-4 h-4" />
              Schedule Event
            </Button>
          </div>

          {loading ? (
            <Card className="p-12 text-center">
              <div className="text-muted-foreground">Loading events...</div>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Upcoming Events */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
                  <Badge variant="secondary">{upcomingEvents.length}</Badge>
                </div>
                
                {upcomingEvents.length === 0 ? (
                  <Card className="p-8 text-center border-dashed">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No upcoming events scheduled</p>
                  </Card>
                ) : (
                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 to-teal-500"></div>
                    <div className="space-y-6">
                      {upcomingEvents.map((ev, idx) => (
                        <div key={ev.id} className="relative flex items-start gap-6">
                          <div className="relative z-10 h-12 w-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <Card className="flex-1 hover:shadow-lg transition-all duration-300 border-l-4 border-l-emerald-500">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{ev.title}</h3>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {new Date(ev.startDate).toLocaleDateString()} at {new Date(ev.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                    {ev.location && (
                                      <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {ev.location}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => { setSelectedEvent(ev); setShowDetails(true); }} className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => handleEdit(ev)} className="bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700">
                                    <Settings className="w-4 h-4" />
                                  </Button>
                                  <Button variant="destructive" size="sm" onClick={() => handleDelete(ev.id)} className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800">
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  {ev.teacher?.user?.name && (
                                    <div className="flex items-center gap-2">
                                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                                        {ev.teacher.user.name.split(' ').map((n:string) => n[0]).join('')}
                                      </div>
                                      <span className="text-sm font-medium">{ev.teacher.user.name}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {(ev.volunteers || []).length} volunteer{(ev.volunteers || []).length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Past Events */}
              {pastEvents.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Past Events</h2>
                    <Badge variant="outline">{pastEvents.length}</Badge>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-400 to-gray-500"></div>
                    <div className="space-y-6">
                      {pastEvents.slice(0, 5).map((ev) => (
                        <div key={ev.id} className="relative flex items-start gap-6">
                          <div className="relative z-10 h-12 w-12 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center shadow-lg">
                            <Clock className="w-5 h-5 text-white" />
                          </div>
                          <Card className="flex-1 opacity-75 hover:opacity-100 transition-all duration-300 border-l-4 border-l-gray-400">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-700 mb-2">{ev.title}</h3>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {timeAgo(ev.startDate)}
                                    </div>
                                    {ev.location && (
                                      <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {ev.location}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => { setSelectedEvent(ev); setShowDetails(true); }} className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button variant="destructive" size="sm" onClick={() => handleDelete(ev.id)} className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800">
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  {ev.teacher?.user?.name && (
                                    <div className="flex items-center gap-2">
                                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white text-sm font-medium">
                                        {ev.teacher.user.name.split(' ').map((n:string) => n[0]).join('')}
                                      </div>
                                      <span className="text-sm font-medium text-gray-600">{ev.teacher.user.name}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {(ev.volunteers || []).length} volunteer{(ev.volunteers || []).length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <EventFormModal open={openForm} onOpenChange={(v)=>{ if(!v){ setEditing(null); setOpenForm(false);} else setOpenForm(true); }} event={editing} onSaved={onSaved} />
          <EventDetailsModal event={selectedEvent} open={showDetails} onOpenChange={setShowDetails} />
        </main>
      </div>
    </div>
  );
}