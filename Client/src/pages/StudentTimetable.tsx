import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, User, Filter } from "lucide-react";
import StudentSidebar from "@/components/StudentSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { timetableAPI } from '@/lib/api';

const StudentTimetable = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetables = async () => {
      try {
        const response = await timetableAPI.getTimetables();
        setTimetables(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch timetables:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetables();
  }, []);

  // Normalize timetable day codes to readable names
  const dayMap: Record<string, string> = { MON: 'Monday', TUE: 'Tuesday', WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday', SUN: 'Sunday' };
  const groupedTimetable = Object.entries(dayMap).map(([code, name]) => ({ day: name, classes: timetables.filter(t => (t.day || '').toUpperCase() === code) }));

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
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {groupedTimetable.map((day, dayIndex) => (
              <Card key={dayIndex} className="border-0 shadow-lg bg-white/80 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-center text-lg font-semibold text-gray-900">
                    {day.day}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {day.classes.length > 0 ? day.classes.map((timetableItem, classIndex) => (
                    <div key={classIndex} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">
                          {formatTime(timetableItem.startMinute)} - {formatTime(timetableItem.endMinute)}
                        </span>
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 mb-1">{timetableItem.subject?.name}</h4>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{timetableItem.teacher?.user?.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{timetableItem.classroom?.name}</span>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 border text-xs mt-2">
                        Class
                      </Badge>
                    </div>
                  )) : (
                    <div className="p-4 text-center text-gray-500">
                      <p className="text-sm">No classes scheduled</p>
                    </div>
                  )}
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