import { useState, useEffect } from "react";
import { Calendar, Clock, FileText, Trophy, AlertCircle, CheckCircle } from "lucide-react";
import StudentSidebar from "@/components/StudentSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { examAPI, studentAPI, resultAPI } from '@/lib/api';

const StudentExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        // Get current student
        const studentResponse = await studentAPI.getCurrentStudent();
        const studentId = studentResponse.data.student.id;
        const studentClassId = studentResponse.data.student.classId;
        
        // Get all exams
        const examResponse = await examAPI.getExams();
        const allExams = examResponse.data.exams || [];
        
        // Filter exams for student's class
        const classExams = allExams.filter(exam => exam.classId === studentClassId);
        
        // Fetch exam details with results for each exam
        const apiExams = await Promise.all(
          classExams.map(async (exam) => {
            try {
              const detailsResponse = await examAPI.getExamDetails(exam.id);
              const examDetails = detailsResponse.data.exam;
              
              // Find student's result in the exam details
              const studentResult = examDetails.results?.find(result => result.studentId === studentId);
              
              return {
                id: exam.id,
                subject: exam.subject?.name || 'Unknown',
                type: exam.name || 'Exam',
                date: exam.date,
                time: '10:00 AM',
                room: 'Room 101',
                duration: '2 hours',
                syllabus: 'Complete syllabus',
                status: new Date(exam.date) > new Date() ? 'scheduled' : 'completed',
                score: studentResult?.marks || 0,
                maxScore: exam.totalMarks || 100,
                grade: studentResult?.grade || 'N/A',
                hasResult: !!studentResult
              };
            } catch (error) {
              console.error(`Failed to fetch details for exam ${exam.id}:`, error);
              return {
                id: exam.id,
                subject: exam.subject?.name || 'Unknown',
                type: exam.name || 'Exam',
                date: exam.date,
                time: '10:00 AM',
                room: 'Room 101',
                duration: '2 hours',
                syllabus: 'Complete syllabus',
                status: new Date(exam.date) > new Date() ? 'scheduled' : 'completed',
                score: 0,
                maxScore: exam.totalMarks || 100,
                grade: 'N/A',
                hasResult: false
              };
            }
          })
        );
        
        setExams(apiExams);
      } catch (error) {
        console.error('Failed to fetch exams:', error);
        setExams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const upcomingExams = exams.filter(exam => new Date(exam.date) > new Date());
  const pastExams = exams.filter(exam => new Date(exam.date) <= new Date());

  // Using API-provided exams (upcomingExams and pastExams derived from exams array)

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
              {loading ? (
                <div className="space-y-4">
                  {[1,2,3].map((i) => (
                    <Card key={i} className="border-0 shadow-lg bg-white/80 backdrop-blur animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : upcomingExams.length === 0 ? (
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                  <CardContent className="p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming exams</h3>
                    <p className="text-gray-600">Your upcoming exams will appear here.</p>
                  </CardContent>
                </Card>
              ) : upcomingExams.map((exam) => {
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
              {pastExams.filter(exam => exam.hasResult).length === 0 ? (
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                  <CardContent className="p-12 text-center">
                    <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No results available</h3>
                    <p className="text-gray-600">Your exam results will appear here once published.</p>
                  </CardContent>
                </Card>
              ) : (
                pastExams.filter(exam => exam.hasResult).map((exam) => (
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
                ))
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default StudentExams;