import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Users, 
  Search,
  Download,
  Plus,
  TrendingUp,
  Award
} from "lucide-react";
import { TeacherSidebar } from "@/components/TeacherSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import api from '@/lib/api';

const TeacherGrades = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [grades, setGrades] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [marks, setMarks] = useState("");
  const [grade, setGrade] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchGrades();
    fetchExams();
    fetchStudents();
  }, [selectedClass, selectedSubject]);

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedClass !== "all") params["classId"] = selectedClass;
      if (selectedSubject !== "all") params["subjectId"] = selectedSubject;
      
      console.log('Fetching grades with params:', JSON.stringify(params));
      const response = await api.get('/api/grades', { params });
      console.log('Grades response full:', JSON.stringify(response.data, null, 2));
      console.log('Grades data array:', response.data.data);
      console.log('Grades data length:', response.data.data?.length);
      setGrades(response.data.data || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast({ title: "Error", description: "Failed to fetch grades", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const response = await api.get('/api/grades/exams');
      setExams(response.data.data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const params = {};
      if (selectedClass !== "all") params["classId"] = selectedClass;
      
      const response = await api.get('/api/grades/students', { params });
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get('/api/grades/classes');
      console.log('Classes response:', response.data);
      setClasses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({ title: "Error", description: "Failed to fetch classes", variant: "destructive" });
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/api/grades/subjects');
      console.log('Subjects response:', response.data);
      setSubjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({ title: "Error", description: "Failed to fetch subjects", variant: "destructive" });
    }
  };

  const handleAddGrade = async () => {
    if (!selectedExam || !selectedStudent || !marks || !grade) {
      toast({ title: "Validation Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        examId: parseInt(selectedExam),
        studentId: parseInt(selectedStudent),
        marks: Number(marks),
        grade: grade.trim()
      };
      
      console.log('Adding grade with payload:', payload);
      await api.post('/api/grades', payload);
      
      toast({ title: "Success", description: "Grade added successfully" });
      setShowAddGradeModal(false);
      setSelectedExam("");
      setSelectedStudent("");
      setMarks("");
      setGrade("");
      fetchGrades();
    } catch (error) {
      console.error('Add grade error:', error.response?.data || error.message);
      let errorMsg = "Failed to add grade";
      
      if (error.response?.status === 400) {
        const backendMsg = error.response?.data?.message || "";
        if (backendMsg.toLowerCase().includes('already') || backendMsg.toLowerCase().includes('exist') || backendMsg.toLowerCase().includes('duplicate')) {
          errorMsg = "Grade already registered for this student and exam";
        } else {
          errorMsg = backendMsg || "Invalid data provided";
        }
      } else {
        errorMsg = error.response?.data?.message || "Failed to add grade";
      }
      
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
    }
  };

  const handleExportGrades = () => {
    if (grades.length === 0) {
      toast({ title: "No Data", description: "No grades to export", variant: "destructive" });
      return;
    }

    const csvHeaders = "Student Name,Roll Number,Class,Subject,Exam,Marks,Total Marks,Grade\n";
    const csvData = grades.map(result => 
      `"${result.student?.user?.name || ''}","${result.student?.rollNumber || ''}","${result.exam?.class?.name}-${result.exam?.class?.section}","${result.exam?.subject?.name || ''}","${result.exam?.name || ''}",${result.marks},${result.exam?.totalMarks || ''},"${result.grade}"`
    ).join('\n');

    const csvContent = csvHeaders + csvData;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `grades_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Success", description: "Grades exported successfully" });
  };





  const getGradeColor = (grade) => {
    if (grade >= 90) return "text-green-600";
    if (grade >= 80) return "text-blue-600";
    if (grade >= 70) return "text-yellow-600";
    if (grade >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getGradeLetter = (grade) => {
    if (grade >= 90) return "A";
    if (grade >= 80) return "B";
    if (grade >= 70) return "C";
    if (grade >= 60) return "D";
    return "F";
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down": return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const calculateStats = () => {
    if (grades.length === 0) return { average: 0, total: 0, passRate: 0 };
    
    const totalMarks = grades.reduce((sum, grade) => sum + grade.marks, 0);
    const average = (totalMarks / grades.length).toFixed(1);
    const passCount = grades.filter(grade => grade.marks >= 60).length;
    const passRate = ((passCount / grades.length) * 100).toFixed(0);
    
    return { average, total: grades.length, passRate };
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TeacherSidebar />
      
      <div className="flex-1">
        <DashboardHeader />
        
        <main className="p-8 space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Grades & Assessment</h1>
              <p className="text-muted-foreground mt-1">Track and manage student performance</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportGrades}>
                <Download className="w-4 h-4 mr-2" />
                Export Grades
              </Button>
              <Button onClick={() => setShowAddGradeModal(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Grade
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{calculateStats().average}</p>
                    <p className="text-sm text-muted-foreground">Class Average</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{calculateStats().total}</p>
                    <p className="text-sm text-muted-foreground">Students Graded</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{calculateStats().passRate}%</p>
                    <p className="text-sm text-muted-foreground">Pass Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{grades.length}</p>
                    <p className="text-sm text-muted-foreground">Total Grades</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.length > 0 ? classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}-{cls.section}
                      </SelectItem>
                    )) : (
                      <SelectItem value="loading" disabled>Loading classes...</SelectItem>
                    )}
                  </SelectContent>
                </Select>

                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.length > 0 ? subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.name}
                      </SelectItem>
                    )) : (
                      <SelectItem value="loading" disabled>Loading subjects...</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Grades</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Student Grades List */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle>Student Grades</CardTitle>
                  <CardDescription>View all student grades and exam results</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                      <p className="mt-2">Loading grades...</p>
                    </div>
                  ) : grades.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No grades found for the selected filters.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {grades.map((result) => (
                        <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                {result.student?.user?.name?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{result.student?.user?.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {result.exam?.class?.name}-{result.exam?.class?.section} • {result.exam?.subject?.name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="text-sm text-muted-foreground">{result.exam?.name}</p>
                                <p className="font-bold">{result.marks}/{result.exam?.totalMarks}</p>
                              </div>
                              <Badge className="bg-green-100 text-green-800">
                                {result.grade}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Grade Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Grade Distribution</CardTitle>
                    <CardDescription>Distribution of grades across all students</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">A (90-100)</span>
                        <div className="flex items-center gap-2 flex-1 ml-4">
                          <Progress value={25} className="flex-1" />
                          <span className="text-sm text-muted-foreground w-12">25%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">B (80-89)</span>
                        <div className="flex items-center gap-2 flex-1 ml-4">
                          <Progress value={35} className="flex-1" />
                          <span className="text-sm text-muted-foreground w-12">35%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">C (70-79)</span>
                        <div className="flex items-center gap-2 flex-1 ml-4">
                          <Progress value={25} className="flex-1" />
                          <span className="text-sm text-muted-foreground w-12">25%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">D (60-69)</span>
                        <div className="flex items-center gap-2 flex-1 ml-4">
                          <Progress value={10} className="flex-1" />
                          <span className="text-sm text-muted-foreground w-12">10%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">F (0-59)</span>
                        <div className="flex items-center gap-2 flex-1 ml-4">
                          <Progress value={5} className="flex-1" />
                          <span className="text-sm text-muted-foreground w-12">5%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Top Performers</CardTitle>
                    <CardDescription>Students with highest overall grades</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {grades
                        .sort((a, b) => b.marks - a.marks)
                        .slice(0, 5)
                        .map((result, index) => (
                          <div key={result.id} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{result.student?.user?.name}</p>
                              <p className="text-sm text-muted-foreground">{result.exam?.class?.name}-{result.exam?.class?.section}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">
                                {result.marks}/{result.exam?.totalMarks}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Grade {result.grade}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="detailed" className="space-y-6">
              {/* Student Grades Table */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle>Detailed Grade Report</CardTitle>
                  <CardDescription>Complete grade breakdown for all students</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                      <p className="mt-2">Loading grades...</p>
                    </div>
                  ) : grades.length === 0 ? (
                    <div className="text-center py-8">
                      <p>No grades found for the selected filters.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Exam</TableHead>
                          <TableHead>Marks</TableHead>
                          <TableHead>Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {grades.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{result.student?.user?.name}</p>
                                <p className="text-sm text-muted-foreground">{result.student?.rollNumber}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {result.exam?.class?.name}-{result.exam?.class?.section}
                              </Badge>
                            </TableCell>
                            <TableCell>{result.exam?.subject?.name}</TableCell>
                            <TableCell>{result.exam?.name}</TableCell>
                            <TableCell>
                              <span className="font-bold">{result.marks}/{result.exam?.totalMarks}</span>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800">
                                {result.grade}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Performance Trends</CardTitle>
                    <CardDescription>Grade trends over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                        <p>Performance analytics chart will be displayed here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Subject Comparison</CardTitle>
                    <CardDescription>Average grades by subject</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Mathematics</span>
                        <div className="flex items-center gap-2">
                          <Progress value={85} className="w-24" />
                          <span className="text-sm font-bold">85%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Physics</span>
                        <div className="flex items-center gap-2">
                          <Progress value={82} className="w-24" />
                          <span className="text-sm font-bold">82%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Chemistry</span>
                        <div className="flex items-center gap-2">
                          <Progress value={88} className="w-24" />
                          <span className="text-sm font-bold">88%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      {/* Add Grade Modal */}
      <Dialog open={showAddGradeModal} onOpenChange={setShowAddGradeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Grade</DialogTitle>
            <DialogDescription>Add a grade for a student exam</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Exam:</label>
              <select 
                value={selectedExam} 
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full p-2 border rounded mt-1"
              >
                <option value="">Select Exam</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name} - {exam.subject?.name} ({exam.class?.name}-{exam.class?.section})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Student:</label>
              <select 
                value={selectedStudent} 
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full p-2 border rounded mt-1"
              >
                <option value="">Select Student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.user?.name} - {student.rollNumber}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Marks:</label>
              <Input
                type="number"
                placeholder="Enter marks"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Grade:</label>
              <Input
                placeholder="Enter grade (e.g., A+, B, C)"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleAddGrade}
                disabled={!selectedExam || !selectedStudent || !marks}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                Add Grade
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddGradeModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherGrades;