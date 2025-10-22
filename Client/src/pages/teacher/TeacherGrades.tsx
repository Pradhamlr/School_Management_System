import { useState } from "react";
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Eye,
  TrendingUp,
  Award,
  FileText
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

const TeacherGrades = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  const classes = [
    { id: "10-A", name: "Mathematics 10-A" },
    { id: "11-B", name: "Physics 11-B" },
    { id: "12-A", name: "Chemistry 12-A" },
    { id: "9-C", name: "Mathematics 9-C" }
  ];

  const subjects = [
    { id: "math", name: "Mathematics" },
    { id: "physics", name: "Physics" },
    { id: "chemistry", name: "Chemistry" }
  ];

  const students = [
    {
      id: 1,
      name: "John Doe",
      rollNumber: "10A001",
      class: "10-A",
      subject: "Mathematics",
      grades: {
        midterm: 85,
        final: 92,
        assignments: 88,
        overall: 89
      },
      trend: "up"
    },
    {
      id: 2,
      name: "Jane Smith",
      rollNumber: "10A002",
      class: "10-A",
      subject: "Mathematics",
      grades: {
        midterm: 78,
        final: 82,
        assignments: 85,
        overall: 82
      },
      trend: "up"
    },
    {
      id: 3,
      name: "Mike Johnson",
      rollNumber: "11B001",
      class: "11-B",
      subject: "Physics",
      grades: {
        midterm: 92,
        final: 88,
        assignments: 90,
        overall: 90
      },
      trend: "down"
    },
    {
      id: 4,
      name: "Sarah Wilson",
      rollNumber: "12A001",
      class: "12-A",
      subject: "Chemistry",
      grades: {
        midterm: 95,
        final: 94,
        assignments: 96,
        overall: 95
      },
      trend: "stable"
    }
  ];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === "all" || student.class === selectedClass;
    const matchesSubject = selectedSubject === "all" || student.subject.toLowerCase() === subjects.find(s => s.id === selectedSubject)?.name.toLowerCase();
    return matchesSearch && matchesClass && matchesSubject;
  });

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-green-600";
    if (grade >= 80) return "text-blue-600";
    if (grade >= 70) return "text-yellow-600";
    if (grade >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getGradeLetter = (grade: number) => {
    if (grade >= 90) return "A";
    if (grade >= 80) return "B";
    if (grade >= 70) return "C";
    if (grade >= 60) return "D";
    return "F";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down": return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
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
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Grades
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
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
                    <p className="text-2xl font-bold">87.5</p>
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
                    <p className="text-2xl font-bold">95</p>
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
                    <p className="text-2xl font-bold">78%</p>
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
                    <p className="text-2xl font-bold">+5.2%</p>
                    <p className="text-sm text-muted-foreground">Improvement</p>
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
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
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
                      {filteredStudents
                        .sort((a, b) => b.grades.overall - a.grades.overall)
                        .slice(0, 5)
                        .map((student, index) => (
                          <div key={student.id} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-muted-foreground">{student.class}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${getGradeColor(student.grades.overall)}`}>
                                {student.grades.overall}%
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Grade {getGradeLetter(student.grades.overall)}
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
              {/* Detailed Grades Table */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle>Student Grades</CardTitle>
                  <CardDescription>Detailed grade breakdown for all students</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Midterm</TableHead>
                        <TableHead>Final</TableHead>
                        <TableHead>Assignments</TableHead>
                        <TableHead>Overall</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Trend</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {student.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{student.class}</Badge>
                          </TableCell>
                          <TableCell>{student.subject}</TableCell>
                          <TableCell className={getGradeColor(student.grades.midterm)}>
                            {student.grades.midterm}%
                          </TableCell>
                          <TableCell className={getGradeColor(student.grades.final)}>
                            {student.grades.final}%
                          </TableCell>
                          <TableCell className={getGradeColor(student.grades.assignments)}>
                            {student.grades.assignments}%
                          </TableCell>
                          <TableCell className={getGradeColor(student.grades.overall)}>
                            <span className="font-bold">{student.grades.overall}%</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getGradeColor(student.grades.overall)} bg-transparent border`}>
                              {getGradeLetter(student.grades.overall)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getTrendIcon(student.trend)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
    </div>
  );
};

export default TeacherGrades;