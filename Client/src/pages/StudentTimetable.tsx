import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, User, Filter } from "lucide-react";
import StudentSidebar from "@/components/StudentSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { timetableAPI, studentAPI } from '@/lib/api';

const StudentTimetable = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);

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
        
        // Filter timetables for student's class
        console.log('Student class ID:', studentClassId);
        console.log('Sample timetable:', allTimetables[0]);
        console.log('Days in DB:', [...new Set(allTimetables.map(t => t.day))]);
        const studentTimetables = allTimetables.filter(t => t.classId === studentClassId);
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
      const classForPeriod = dayClasses.find(t => t.startMinute === period.start);
      return {
        period: period.period,
        startMinute: period.start,
        endMinute: period.end,
        class: classForPeriod || null
      };
    });

    return {
      day: name,
      periods: periodsWithClasses
    };
  });

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Lecture': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Lab': return 'bg-green-100 text-green-800 border-green-200';
      case 'Tutorial': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Test': return 'bg-red-100 text-red-800 border-red-200';
      case 'Break': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <StudentSidebar />
      
      <div className="flex-1">
        <DashboardHeader />
        
        <main className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Timetable</h1>
              <p className="text-gray-600 mt-1">View your weekly class schedule</p>
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter by Subject
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {[1,2,3,4,5].map((i) => (
                <Card key={i} className="border-0 shadow-lg bg-white/80 backdrop-blur animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[1,2,3].map((j) => (
                      <div key={j} className="h-20 bg-gray-200 rounded"></div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {groupedTimetable.map((day, dayIndex) => (
              <Card key={dayIndex} className="border-0 shadow-lg bg-white/90 backdrop-blur">
                <CardHeader className="pb-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
                  <CardTitle className="text-center text-lg font-bold">
                    {day.day}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                  {day.periods.map((periodSlot, periodIndex) => {
                    const timetableItem = periodSlot.class;
                    const subjectColors = {
                      'Mathematics': 'bg-blue-50 border-blue-200 text-blue-800',
                      'English': 'bg-green-50 border-green-200 text-green-800',
                      'Science': 'bg-purple-50 border-purple-200 text-purple-800',
                      'History': 'bg-orange-50 border-orange-200 text-orange-800',
                      'Geography': 'bg-teal-50 border-teal-200 text-teal-800'
                    };
                    
                    if (!timetableItem) {
                      // Empty period slot
                      return (
                        <div key={periodIndex} className="p-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              P{periodSlot.period}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatTime(periodSlot.startMinute)}-{formatTime(periodSlot.endMinute)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 text-center py-2">Free Period</p>
                        </div>
                      );
                    }
                    
                    const colorClass = subjectColors[timetableItem.subject?.name] || 'bg-gray-50 border-gray-200 text-gray-800';
                    
                    return (
                      <div key={periodIndex} className={`p-2 rounded-lg border-2 ${colorClass} hover:shadow-md transition-all`}>
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            P{periodSlot.period}
                          </Badge>
                          <span className="text-xs font-medium">
                            {formatTime(periodSlot.startMinute)}-{formatTime(periodSlot.endMinute)}
                          </span>
                        </div>
                        
                        <h4 className="font-bold text-sm mb-1 truncate">{timetableItem.subject?.name}</h4>
                        <div className="text-xs space-y-0.5">
                          <div className="flex items-center gap-1 truncate">
                            <User className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{timetableItem.teacher?.user?.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span>{timetableItem.classroom?.name}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentTimetable;