import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, User, Filter, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StudentSidebar from "@/components/StudentSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { timetableAPI, studentAPI } from '@/lib/api';

const StudentTimetable = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [subjectFilter, setSubjectFilter] = useState<string | 'ALL'>('ALL');

  useEffect(() => {
    const fetchTimetables = async () => {
      try {
        // Get current student first
        const studentResponse = await studentAPI.getCurrentStudent();
        console.log('Student response:', studentResponse);
        const studentId = studentResponse.data.student?.id || studentResponse.data.id;
        const studentClassId = studentResponse.data.student?.classId || studentResponse.data.classId;
        
        // Get timetables for student's class
        const response = await timetableAPI.getTimetables();
        console.log('Timetables response:', response);
        const allTimetables = response.data?.data || [];
        console.log('All timetables:', allTimetables);
        console.log('Total timetables found:', allTimetables.length);
        
  // Filter timetables for student's class (support either nested `class.id` or flat `classId`)
  console.log('Student class ID:', studentClassId);
  console.log('Sample timetable:', allTimetables[0]);
  console.log('Days in DB:', [...new Set(allTimetables.map(t => t.day))]);
  const studentTimetables = allTimetables.filter(t => Number(t.classId ?? t.class?.id) === Number(studentClassId));
        console.log('Filtered timetables:', studentTimetables);
        console.log('Days in filtered:', [...new Set(studentTimetables.map(t => t.day))]);
        console.log('Monday periods:', studentTimetables.filter(t => t.day === 'MON').map(t => ({ start: t.startMinute, end: t.endMinute, subject: t.subject?.name })));
        console.log('All periods count by day:', {
          MON: studentTimetables.filter(t => t.day === 'MON').length,
          TUE: studentTimetables.filter(t => t.day === 'TUE').length,
          WED: studentTimetables.filter(t => t.day === 'WED').length,
          THU: studentTimetables.filter(t => t.day === 'THU').length,
          FRI: studentTimetables.filter(t => t.day === 'FRI').length
        });
        
        setTimetables(studentTimetables);
      } catch (error) {
        console.error('Failed to fetch timetables:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetables();
  }, []);

  // Create 8 periods structure for each day
  const periods = [
    { start: 480, end: 520, period: 1 },   // 8:00-8:40
    { start: 520, end: 560, period: 2 },   // 8:40-9:20
    { start: 560, end: 600, period: 3 },   // 9:20-10:00
    { start: 615, end: 655, period: 4 },   // 10:15-10:55
    { start: 655, end: 695, period: 5 },   // 10:55-11:35
    { start: 695, end: 735, period: 6 },   // 11:35-12:15
    { start: 795, end: 835, period: 7 },   // 13:15-13:55
    { start: 835, end: 875, period: 8 }    // 13:55-14:35
  ];

  const dayMap: Record<string, string> = { MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday' };
  const groupedTimetable = Object.entries(dayMap).map(([code, name]) => {
    const dayClasses = timetables.filter(t => (t.day || '').toUpperCase() === code);
    
    // Create 8 periods for each day, filling with actual classes or empty slots
    const periodsWithClasses = periods.map(period => {
      // Find a class that overlaps this period (more robust than exact start matching)
      const classForPeriod = dayClasses.find(t => (typeof t.startMinute === 'number' && typeof t.endMinute === 'number') && (t.startMinute < period.end && t.endMinute > period.start));
      return {
        period: period.period,
        // if a real class exists, use its actual times for display; otherwise fall back to the period template
        startMinute: classForPeriod ? classForPeriod.startMinute : period.start,
        endMinute: classForPeriod ? classForPeriod.endMinute : period.end,
        class: classForPeriod || null
      };
    });

    return {
      day: name,
      periods: periodsWithClasses
    };
  });

  // build list of unique subjects for filter
  const subjects = Array.from(new Map(timetables.map((t:any) => [t.subject?.id, t.subject])).values()).filter(Boolean) as any[];

  // deterministic light Tailwind color classes per subject
  const subjectPalette = [
    'bg-blue-50 border-blue-200 text-blue-800',
    'bg-green-50 border-green-200 text-green-800',
    'bg-purple-50 border-purple-200 text-purple-800',
    'bg-orange-50 border-orange-200 text-orange-800',
    'bg-teal-50 border-teal-200 text-teal-800',
    'bg-pink-50 border-pink-200 text-pink-800',
    'bg-amber-50 border-amber-200 text-amber-800',
    'bg-sky-50 border-sky-200 text-sky-800',
    'bg-rose-50 border-rose-200 text-rose-800',
    'bg-lime-50 border-lime-200 text-lime-800',
  ];
  const getSubjectClass = (subject:any) => {
    const key = String(subject?.id ?? subject?.name ?? '');
    let h = 0; for (let i=0;i<key.length;i++) h = (h*31 + key.charCodeAt(i))|0;
    return subjectPalette[Math.abs(h) % subjectPalette.length];
  };

  // Map subject names to the same light styles used in TeacherTimetable where possible,
  // otherwise fall back to the deterministic palette
  const getSubjectColor = (subjectOrName: any) => {
    const name = typeof subjectOrName === 'string' ? subjectOrName : subjectOrName?.name;
    switch ((name || '').toString()) {
      case 'Mathematics': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Physics': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Chemistry': return 'bg-green-100 text-green-800 border-green-200';
      case 'English': return 'bg-green-50 border-green-200 text-green-800';
      case 'Science': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'History': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'Geography': return 'bg-teal-50 border-teal-200 text-teal-800';
      default: return getSubjectClass({ name });
    }
  };
  // simple time formatter: minutes -> HH:MM
  const formatTime = (minutes: number | undefined | null) => {
    if (typeof minutes !== 'number' || Number.isNaN(minutes)) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <StudentSidebar />

      <div className="flex-1">
        <DashboardHeader />

        <main className="p-6 space-y-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Timetable</span>
              </CardTitle>

              <div className="flex items-center gap-2 ml-auto">
                <Select onValueChange={(v:any) => setSubjectFilter(v)} defaultValue="ALL">
                  <SelectTrigger className="w-48">
                    <SelectValue>{subjectFilter === 'ALL' ? 'All Subjects' : subjects.find(s => String(s.id) === String(subjectFilter))?.name}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Subjects</SelectItem>
                    {subjects.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            {loading ? (
              <CardContent className="p-6">Loading...</CardContent>
            ) : (
              <CardContent className="p-2">
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-6 gap-4 min-w-[900px]">
                    <div className="font-semibold text-center py-4 border-b border-border/50">Time</div>
                    {groupedTimetable.map((d) => (
                      <div key={d.day} className="font-semibold text-center py-4 border-b border-border/50">
                        <div>{d.day}</div>
                        <div className="text-sm text-muted-foreground font-normal"></div>
                      </div>
                    ))}

                    {(() => {
                      const daySlotsMap: Record<string, any[]> = {};
                      const usedByDay: Record<string, Set<string>> = {};
                      // Build raw day->slots map from the fetched timetables (not from grouped periods)
                      const reverseDayCode: Record<string,string> = { Monday: 'MON', Tuesday: 'TUE', Wednesday: 'WED', Thursday: 'THU', Friday: 'FRI' };
                      groupedTimetable.forEach(d => {
                        const code = reverseDayCode[d.day];
                        daySlotsMap[d.day] = timetables.filter((t:any) => (t.day || '').toUpperCase() === code).sort((a,b) => (a.startMinute||0)-(b.startMinute||0));
                        usedByDay[d.day] = new Set();
                      });

                      return periods.map((period) => (
                        <div key={period.period} className="contents">
                          {/* Compute a display time for the left label: use the earliest overlapping slot start across all days for this period row; fall back to the period template start */}
                          {(() => {
                            // Prefer a slot that *starts* within this period (so multi-period slots only show their start once).
                            // If none starts here, fall back to the earliest overlapping visible slot, then to the period template start.
                            let startHere: number | null = null;
                            let earliestOverlap: number | null = null;

                            for (const dName of Object.keys(daySlotsMap)) {
                              const slots = daySlotsMap[dName] || [];
                              for (const s of slots) {
                                if (subjectFilter !== 'ALL' && String(s.subject?.id) !== String(subjectFilter)) continue;
                                const sStart = Number(s.startMinute || 0);
                                const sEnd = Number(s.endMinute || sStart + 45);
                                const overlaps = sStart < period.end && sEnd > period.start;
                                const startsInPeriod = sStart >= period.start && sStart < period.end;
                                if (startsInPeriod) {
                                  if (startHere === null || sStart < startHere) startHere = sStart;
                                }
                                if (overlaps) {
                                  if (earliestOverlap === null || sStart < earliestOverlap) earliestOverlap = sStart;
                                }
                              }
                            }

                            const timeVal = startHere ?? earliestOverlap ?? period.start;
                            return <div className="text-center py-4 text-sm text-muted-foreground font-medium border-r border-border/50">{formatTime(timeVal)}</div>;
                          })()}

                          {groupedTimetable.map((d) => {
                            const day = d.day;
                            const slot = (daySlotsMap[day] || []).find((s:any) => {
                              const sStart = Number(s.startMinute||0);
                              const sEnd = Number(s.endMinute||sStart+45);
                              const overlaps = sStart < period.end && sEnd > period.start;
                              const sKey = s.id ?? `${sStart}-${sEnd}-${s.subject?.id ?? s.subject?.name}`;
                              return overlaps && !usedByDay[day].has(String(sKey));
                            });

                            if (!slot) {
                              return (
                                <div key={`${day}-${period.period}`} className="p-2 min-h-[80px] border-r border-b border-border/50">
                                  <div className="h-full p-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 flex flex-col justify-center">
                                    <div className="text-xs text-gray-500 text-center">Free</div>
                                  </div>
                                </div>
                              );
                            }

                            const slotKey = slot.id ?? `${slot.startMinute}-${slot.endMinute}-${slot.subject?.id ?? slot.subject?.name}`;
                            usedByDay[day].add(String(slotKey));

                            if (subjectFilter !== 'ALL' && String(slot.subject?.id) !== String(subjectFilter)) {
                              return (
                                <div key={`${day}-${period.period}`} className="p-2 min-h-[80px] border-r border-b border-border/50">
                                  <div className="h-full p-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 flex flex-col justify-center">
                                    <div className="text-xs text-gray-500 text-center">Free</div>
                                  </div>
                                </div>
                              );
                            }

                            const colorClass = getSubjectColor(slot.subject);
                            const teacherName = slot.teacher?.user?.name || slot.teacher?.name || 'TBA';
                            const teacherInitials = (teacherName || 'T').split(' ').map((n:string)=>n[0]).join('').slice(0,2).toUpperCase();
                            return (
                              <div key={`${day}-${period.period}`} className="p-2 min-h-[80px] border-r border-b border-border/50">
                                <div className={`p-3 rounded-lg border-2 h-full ${colorClass} hover:shadow-md transition-shadow group`}>
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-sm">{slot.subject?.name}</h4>
                                      <div className="flex items-center gap-2 mt-1">
    
                                        <div className="text-xs">
                                          <div className="font-medium">{teacherName}</div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSelectedSlot(slot)}>
                                        <Eye className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs opacity-80">
                                    <MapPin className="w-3 h-3" />
                                    <span>{slot.classroom?.name || 'Room N/A'}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs opacity-80 mt-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatTime(Number(slot.startMinute))} - {formatTime(Number(slot.endMinute))}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* selected slot detail drawer */}
          {selectedSlot && (
            <div className="fixed right-6 bottom-6 w-96 z-50">
              <div className="bg-white rounded-lg shadow-lg border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{selectedSlot.subject?.name}</h4>
                  </div>
                  <div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedSlot(null)}>Close</Button>
                  </div>
                </div>
                <div className="mt-3 text-sm">
                  <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4" />{formatTime(Number(selectedSlot.startMinute))} - {formatTime(Number(selectedSlot.endMinute))}</div>
                  <div className="flex items-center gap-2 mb-2"><MapPin className="w-4 h-4" />{selectedSlot.classroom?.name || 'Room N/A'}</div>
                  <div className="flex items-center gap-2 mb-2">{selectedSlot.teacher?.user?.name || 'TBA'}</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentTimetable;