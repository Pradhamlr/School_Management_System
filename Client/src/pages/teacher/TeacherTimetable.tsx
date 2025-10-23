import { useState } from "react";
import { 
  Clock, 
  Calendar, 
  MapPin, 
  Users,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Eye
} from "lucide-react";
import { TeacherSidebar } from "@/components/TeacherSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TeacherTimetable = () => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedView, setSelectedView] = useState("week");

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const schedule = {
    Monday: [
      { time: "09:00", subject: "Mathematics", class: "10-A", room: "Room 101", duration: 60 },
      { time: "11:00", subject: "Mathematics", class: "9-C", room: "Room 103", duration: 60 },
      { time: "14:00", subject: "Chemistry", class: "12-A", room: "Lab 2", duration: 60 }
    ],
    Tuesday: [
      { time: "10:00", subject: "Physics", class: "11-B", room: "Lab 1", duration: 60 },
      { time: "13:00", subject: "Mathematics", class: "10-A", room: "Room 101", duration: 60 },
      { time: "15:00", subject: "Physics", class: "12-A", room: "Lab 2", duration: 60 }
    ],
    Wednesday: [
      { time: "09:00", subject: "Mathematics", class: "10-A", room: "Room 101", duration: 60 },
      { time: "11:00", subject: "Chemistry", class: "12-A", room: "Lab 2", duration: 60 },
      { time: "14:00", subject: "Mathematics", class: "9-C", room: "Room 103", duration: 60 }
    ],
    Thursday: [
      { time: "10:00", subject: "Physics", class: "11-B", room: "Lab 1", duration: 60 },
      { time: "12:00", subject: "Mathematics", class: "10-A", room: "Room 101", duration: 60 },
      { time: "15:00", subject: "Chemistry", class: "12-A", room: "Lab 2", duration: 60 }
    ],
    Friday: [
      { time: "09:00", subject: "Mathematics", class: "9-C", room: "Room 103", duration: 60 },
      { time: "11:00", subject: "Physics", class: "11-B", room: "Lab 1", duration: 60 },
      { time: "14:00", subject: "Chemistry", class: "12-A", room: "Lab 2", duration: 60 }
    ]
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'Mathematics': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Physics': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Chemistry': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCurrentWeekDates = () => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1 + (currentWeek * 7)));
    const dates = [];
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const weekDates = getCurrentWeekDates();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TeacherSidebar />
      
      <div className="flex-1">
        <DashboardHeader />
        
        <main className="p-8 space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Timetable</h1>
              <p className="text-muted-foreground mt-1">View and manage your class schedule</p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedView} onValueChange={setSelectedView}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week View</SelectItem>
                  <SelectItem value="day">Day View</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Class
              </Button>
            </div>
          </div>

          {/* Week Navigation */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(currentWeek - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="text-center">
                  <h2 className="text-lg font-semibold">
                    {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {' '}
                    {weekDates[4].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {currentWeek === 0 ? 'This Week' : currentWeek > 0 ? `${currentWeek} week(s) ahead` : `${Math.abs(currentWeek)} week(s) ago`}
                  </p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(currentWeek + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">18</p>
                    <p className="text-sm text-muted-foreground">Classes This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">95</p>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-sm text-muted-foreground">Subjects</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">5</p>
                    <p className="text-sm text-muted-foreground">Rooms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timetable Grid */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Weekly Schedule
              </CardTitle>
              <CardDescription>Your class schedule for the selected week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-6 gap-4 min-w-[800px]">
                  {/* Time column header */}
                  <div className="font-semibold text-center py-4 border-b border-border/50">
                    Time
                  </div>
                  
                  {/* Day headers */}
                  {days.map((day, index) => (
                    <div key={day} className="font-semibold text-center py-4 border-b border-border/50">
                      <div>{day}</div>
                      <div className="text-sm text-muted-foreground font-normal">
                        {weekDates[index].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  ))}

                  {/* Time slots and classes */}
                  {timeSlots.map((time) => (
                    <div key={time} className="contents">
                      {/* Time slot */}
                      <div className="text-center py-4 text-sm text-muted-foreground font-medium border-r border-border/50">
                        {time}
                      </div>
                      
                      {/* Classes for each day */}
                      {days.map((day) => {
                        const daySchedule = schedule[day as keyof typeof schedule] || [];
                        const classAtTime = daySchedule.find(cls => cls.time === time);
                        
                        return (
                          <div key={`${day}-${time}`} className="p-2 min-h-[80px] border-r border-b border-border/50">
                            {classAtTime && (
                              <div className={`p-3 rounded-lg border-2 h-full ${getSubjectColor(classAtTime.subject)} hover:shadow-md transition-shadow cursor-pointer group`}>
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-sm">{classAtTime.subject}</h4>
                                    <p className="text-xs opacity-80">{classAtTime.class}</p>
                                  </div>
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <Eye className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs opacity-80">
                                  <MapPin className="w-3 h-3" />
                                  <span>{classAtTime.room}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs opacity-80 mt-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{classAtTime.duration}min</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Classes */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                Today's Classes
              </CardTitle>
              <CardDescription>Your schedule for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedule.Monday.map((cls, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-16 text-sm font-medium text-green-600">
                      {cls.time}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{cls.subject}</h4>
                        <Badge variant="outline">{cls.class}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{cls.room}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{cls.duration} minutes</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default TeacherTimetable;