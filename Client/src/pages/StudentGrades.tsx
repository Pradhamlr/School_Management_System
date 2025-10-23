import { useState, useEffect } from "react";
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  BookOpen, 
  Calendar, 
  Download, 
  Eye,
  Filter,
  BarChart3,
  Target,
  Award,
  Star,
  ChevronRight,
  FileText,
  User
} from "lucide-react";
import StudentSidebar from "@/components/StudentSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { studentAPI, resultAPI } from '@/lib/api';

const StudentGrades = () => {
  const [selectedSemester, setSelectedSemester] = useState("current");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const studentResponse = await studentAPI.getCurrentStudent();
        const studentId = studentResponse.data.student.id;
        
        const gradesResponse = await resultAPI.getStudentResults(studentId);
        const apiGrades = (gradesResponse.data.results || []).map(result => ({
          subject: result.exam?.subject?.name || 'Unknown',
          teacher: 'Teacher',
          currentGrade: result.grade || 'N/A',
          percentage: Math.round((result.marks / result.exam?.totalMarks) * 100) || 0,
          credits: 4,
          assignments: [],
          trend: 'stable',
          trendValue: 0
        }));
        
        setGrades(apiGrades.length > 0 ? apiGrades : mockGrades);
      } catch (error) {
        console.error('Failed to fetch grades:', error);
        setGrades(mockGrades);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  const mockGrades = [
    {
      subject: "Mathematics",
      teacher: "Dr. Sarah Johnson",
      currentGrade: "A",
      percentage: 92,
      credits: 4,
      assignments: [
        { name: "Quiz 1", score: 95, maxScore: 100, weight: 10, date: "2024-01-15" },
        { name: "Midterm Exam", score: 88, maxScore: 100, weight: 30, date: "2024-01-20" },
        { name: "Assignment 1", score: 94, maxScore: 100, weight: 15, date: "2024-01-10" },
        { name: "Assignment 2", score: 90, maxScore: 100, weight: 15, date: "2024-01-25" }
      ],
      trend: "up",
      trendValue: 3.2
    },
    {
      subject: "Physics",
      teacher: "Prof. Michael Chen",
      currentGrade: "B+",
      percentage: 87,
      credits: 4,
      assignments: [
        { name: "Lab Report 1", score: 85, maxScore: 100, weight: 20, date: "2024-01-12" },
        { name: "Quiz 1", score: 92, maxScore: 100, weight: 10, date: "2024-01-18" },
        { name: "Midterm Exam", score: 84, maxScore: 100, weight: 30, date: "2024-01-22" },
        { name: "Lab Report 2", score: 88, maxScore: 100, weight: 20, date: "2024-01-28" }
      ],
      trend: "up",
      trendValue: 1.8
    },
    {
      subject: "Chemistry",
      teacher: "Dr. Emily Davis",
      currentGrade: "A-",
      percentage: 89,
      credits: 4,
      assignments: [
        { name: "Quiz 1", score: 87, maxScore: 100, weight: 10, date: "2024-01-14" },
        { name: "Lab Practical", score: 93, maxScore: 100, weight: 25, date: "2024-01-19" },
        { name: "Assignment 1", score: 91, maxScore: 100, weight: 15, date: "2024-01-16" },
        { name: "Midterm Exam", score: 86, maxScore: 100, weight: 30, date: "2024-01-24" }
      ],
      trend: "stable",
      trendValue: 0.5
    },
    {
      subject: "English",
      teacher: "Ms. Jennifer Wilson",
      currentGrade: "A",
      percentage: 94,
      credits: 3,
      assignments: [
        { name: "Essay 1", score: 96, maxScore: 100, weight: 25, date: "2024-01-11" },
        { name: "Quiz 1", score: 89, maxScore: 100, weight: 10, date: "2024-01-17" },
        { name: "Presentation", score: 98, maxScore: 100, weight: 20, date: "2024-01-21" },
        { name: "Midterm Exam", score: 92, maxScore: 100, weight: 30, date: "2024-01-26" }
      ],
      trend: "up",
      trendValue: 2.1
    },
    {
      subject: "Computer Science",
      teacher: "Mr. David Brown",
      currentGrade: "A+",
      percentage: 98,
      credits: 4,
      assignments: [
        { name: "Project 1", score: 100, maxScore: 100, weight: 30, date: "2024-01-13" },
        { name: "Quiz 1", score: 95, maxScore: 100, weight: 10, date: "2024-01-19" },
        { name: "Assignment 1", score: 98, maxScore: 100, weight: 20, date: "2024-01-15" },
        { name: "Midterm Exam", score: 97, maxScore: 100, weight: 25, date: "2024-01-23" }
      ],
      trend: "up",
      trendValue: 1.5
    },
    {
      subject: "Biology",
      teacher: "Dr. Lisa Anderson",
      currentGrade: "B+",
      percentage: 88,
      credits: 4,
      assignments: [
        { name: "Lab Report 1", score: 86, maxScore: 100, weight: 20, date: "2024-01-16" },
        { name: "Quiz 1", score: 91, maxScore: 100, weight: 10, date: "2024-01-20" },
        { name: "Assignment 1", score: 85, maxScore: 100, weight: 15, date: "2024-01-18" },
        { name: "Midterm Exam", score: 89, maxScore: 100, weight: 30, date: "2024-01-25" }
      ],
      trend: "down",
      trendValue: -1.2
    }
  ];

  const gradeHistory = [
    { semester: "Fall 2023", gpa: 3.7, credits: 18 },
    { semester: "Spring 2023", gpa: 3.8, credits: 17 },
    { semester: "Fall 2022", gpa: 3.6, credits: 16 },
    { semester: "Spring 2022", gpa: 3.9, credits: 18 },
    { semester: "Current", gpa: 3.85, credits: 23 }
  ];

  const performanceData = [
    { month: "Sep", gpa: 3.7 },
    { month: "Oct", gpa: 3.75 },
    { month: "Nov", gpa: 3.8 },
    { month: "Dec", gpa: 3.82 },
    { month: "Jan", gpa: 3.85 }
  ];

  const subjectPerformance = currentGrades.map(grade => ({
    subject: grade.subject.substring(0, 4),
    score: grade.percentage
  }));

  const gradeDistribution = [
    { name: 'A/A+', value: 40, color: '#10B981' },
    { name: 'B+/A-', value: 35, color: '#3B82F6' },
    { name: 'B/B-', value: 20, color: '#F59E0B' },
    { name: 'C+/C', value: 5, color: '#EF4444' }
  ];

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-50 border-green-200';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Target;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const calculateGPA = () => {
    const totalPoints = currentGrades.reduce((sum, grade) => {
      const gradePoints = getGradePoints(grade.currentGrade);
      return sum + (gradePoints * grade.credits);
    }, 0);
    const totalCredits = currentGrades.reduce((sum, grade) => sum + grade.credits, 0);
    return (totalPoints / totalCredits).toFixed(2);
  };

  const getGradePoints = (grade: string) => {
    const gradeMap: { [key: string]: number } = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    };
    return gradeMap[grade] || 0;
  };

  const currentGrades = grades.length > 0 ? grades : mockGrades;
  const filteredGrades = selectedSubject === "all" 
    ? currentGrades 
    : currentGrades.filter(grade => grade.subject === selectedSubject);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <StudentSidebar />
      
      <div className="flex-1">
        <DashboardHeader />
        
        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Academic Performance</h1>
              <p className="text-gray-600 mt-1">Track your grades and academic progress</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download Report
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700">
                <BarChart3 className="w-4 h-4" />
                View Analytics
              </Button>
            </div>
          </div>

          {/* GPA Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 font-medium">Current GPA</p>
                    <p className="text-3xl font-bold text-blue-800">{calculateGPA()}</p>
                    <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +0.05 this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 font-medium">Class Rank</p>
                    <p className="text-3xl font-bold text-green-800">#5</p>
                    <p className="text-sm text-green-600">Top 5% of class</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 font-medium">Credits Earned</p>
                    <p className="text-3xl font-bold text-purple-800">95/120</p>
                    <p className="text-sm text-purple-600">79% completed</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 font-medium">Average Score</p>
                    <p className="text-3xl font-bold text-orange-800">91%</p>
                    <p className="text-sm text-orange-600">Excellent performance</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  GPA Trend
                </CardTitle>
                <CardDescription>Your academic performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[3.5, 4.0]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="gpa" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Subject Performance
                </CardTitle>
                <CardDescription>Current scores by subject</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis domain={[80, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current Semester</SelectItem>
                    <SelectItem value="fall2023">Fall 2023</SelectItem>
                    <SelectItem value="spring2023">Spring 2023</SelectItem>
                    <SelectItem value="fall2022">Fall 2022</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Filter by subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {currentGrades.map(grade => (
                      <SelectItem key={grade.subject} value={grade.subject}>
                        {grade.subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Grades List */}
          <div className="space-y-4">
            {filteredGrades.map((grade, index) => {
              const TrendIcon = getTrendIcon(grade.trend);
              
              return (
                <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg">{grade.subject}</h3>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    <span>{grade.teacher}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <BookOpen className="w-4 h-4" />
                                    <span>{grade.credits} Credits</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <div className={`flex items-center gap-1 ${getTrendColor(grade.trend)}`}>
                                  <TrendIcon className="w-4 h-4" />
                                  <span className="text-sm font-medium">
                                    {grade.trend === 'stable' ? '±' : grade.trend === 'up' ? '+' : ''}{grade.trendValue}%
                                  </span>
                                </div>
                                <Badge className={`${getGradeColor(grade.currentGrade)} border text-lg px-3 py-1`}>
                                  {grade.currentGrade}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Overall Score</span>
                                <span className="font-medium">{grade.percentage}%</span>
                              </div>
                              <Progress value={grade.percentage} className="h-3" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="lg:w-80">
                        <h4 className="font-medium text-gray-900 mb-3">Recent Assignments</h4>
                        <div className="space-y-2">
                          {grade.assignments.slice(0, 3).map((assignment, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{assignment.name}</p>
                                <p className="text-xs text-gray-500">{new Date(assignment.date).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">{assignment.score}/{assignment.maxScore}</p>
                                <p className="text-xs text-gray-500">{assignment.weight}% weight</p>
                              </div>
                            </div>
                          ))}
                          <Button variant="ghost" size="sm" className="w-full text-xs">
                            View All Assignments
                            <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Grade Distribution */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Grade Distribution
              </CardTitle>
              <CardDescription>Your grade distribution across all subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="w-80 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gradeDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {gradeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    {gradeDistribution.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.value}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default StudentGrades;