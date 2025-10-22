import { useState, useEffect } from "react";
import { Calendar, Clock, FileText, Trophy, AlertCircle, CheckCircle } from "lucide-react";
import StudentSidebar from "@/components/StudentSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from '@/lib/api';

const StudentExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await api.get('/api/exams');
        setExams(response.data.exams || []);
      } catch (error) {
        console.error('Failed to fetch exams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const upcomingExams = exams.filter(exam => new Date(exam.date) > new Date());
  const pastExams = exams.filter(exam => new Date(exam.date) <= new Date());

  const mockUpcomingExams = [
    {
      id: 1,
      subject: "Mathematics",
      type: "Final Exam",
      date: "2024-02-15",
      time: "09:00 AM - 12:00 PM",
      room: "Hall A",
      duration: "3 hours",
      syllabus: "Chapters 1-12",
      status: "scheduled"
    },
    {
      id: 2,
      subject: "Physics",
      type: "Midterm Exam",
      date: "2024-02-10",
      time: "02:00 PM - 04:00 PM", 
      room: "Room 201",
      duration: "2 hours",
      syllabus: "Chapters 1-6",
      status: "scheduled"
    },
    {
      id: 3,
      subject: "Chemistry",
      type: "Quiz",
      date: "2024-02-08",
      time: "11:00 AM - 12:00 PM",
      room: "Lab 2",
      duration: "1 hour",
      syllabus: "Chapter 4-5",
      status: "scheduled"
    }
  ];

  const completedExams = [
    {
      id: 4,
      subject: "English",
      type: "Essay Exam",
      date: "2024-01-25",
      score: 94,
      maxScore: 100,
      grade: "A",
      status: "completed"
    },
    {
      id: 5,
      subject: "Computer Science",
      type: "Practical Exam",
      date: "2024-01-20",
      score: 98,
      maxScore: 100,
      grade: "A+",
      status: "completed"
    },
    {
      id: 6,
      subject: "Biology",
      type: "Lab Test",
      date: "2024-01-18",
      score: 87,
      maxScore: 100,
      grade: "B+",
      status: "completed"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'missed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-50 border-green-200';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getDaysUntilExam = (examDate: string) => {
    const exam = new Date(examDate);
    const today = new Date();
    const diffTime = exam.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <StudentSidebar />
      
      <div className="flex-1">
        <DashboardHeader />
        
        <main className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Exams & Results</h1>
              <p className="text-gray-600 mt-1">Track your exam schedule and results</p>
            </div>
          </div>

          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="upcoming">Upcoming Exams</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingExams.map((exam) => {
                const daysUntil = getDaysUntilExam(exam.date);
                const isUrgent = daysUntil <= 3;
                
                return (
                  <Card key={exam.id} className={`border-0 shadow-lg bg-white/80 backdrop-blur ${
                    isUrgent ? 'border-l-4 border-l-orange-500' : ''
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg">{exam.subject}</h3>
                                <p className="text-gray-600">{exam.type}</p>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {isUrgent && <AlertCircle className="w-4 h-4 text-orange-500" />}
                                <Badge className={`${getStatusColor(exam.status)} border`}>
                                  {exam.status}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span>{new Date(exam.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span>{exam.time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <span>{exam.room}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-gray-500" />
                                <span>{exam.duration}</span>
                              </div>
                            </div>
                            
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <strong>Syllabus:</strong> {exam.syllabus}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            isUrgent ? 'text-orange-600' : 'text-blue-600'
                          }`}>
                            {daysUntil > 0 ? `${daysUntil} days` : daysUntil === 0 ? 'Today' : 'Overdue'}
                          </div>
                          <p className="text-sm text-gray-500">
                            {daysUntil > 0 ? 'remaining' : ''}
                          </p>
                          <Button size="sm" className="mt-2">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {completedExams.map((exam) => (
                <Card key={exam.id} className="border-0 shadow-lg bg-white/80 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">{exam.subject}</h3>
                              <p className="text-gray-600">{exam.type}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(exam.date).toLocaleDateString()}
                              </p>
                            </div>
                            
                            <Badge className={`${getStatusColor(exam.status)} border`}>
                              {exam.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge className={`${getGradeColor(exam.grade)} border text-lg px-3 py-1 mb-2`}>
                          {exam.grade}
                        </Badge>
                        <div className="text-lg font-bold text-gray-900">
                          {exam.score}/{exam.maxScore}
                        </div>
                        <p className="text-sm text-gray-500">
                          {Math.round((exam.score / exam.maxScore) * 100)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default StudentExams;