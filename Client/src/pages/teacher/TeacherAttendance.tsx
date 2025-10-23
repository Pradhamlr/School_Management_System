import { useState } from "react";
import { 
  CheckSquare, 
  Users, 
  Calendar, 
  Search,
  Filter,
  Download,
  Plus,
  Check,
  X,
  Clock,
  UserCheck,
  UserX
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

const TeacherAttendance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const classes = [
    { id: "10-A", name: "Mathematics 10-A", students: 25 },
    { id: "11-B", name: "Physics 11-B", students: 20 },
    { id: "12-A", name: "Chemistry 12-A", students: 28 },
    { id: "9-C", name: "Mathematics 9-C", students: 22 }
  ];

  const students = [
    { id: 1, name: "John Doe", rollNumber: "10A001", class: "10-A", status: "present", lastAttendance: "2024-01-12" },
    { id: 2, name: "Jane Smith", rollNumber: "10A002", class: "10-A", status: "absent", lastAttendance: "2024-01-11" },
    { id: 3, name: "Mike Johnson", rollNumber: "10A003", class: "10-A", status: "present", lastAttendance: "2024-01-12" },
    { id: 4, name: "Sarah Wilson", rollNumber: "10A004", class: "10-A", status: "late", lastAttendance: "2024-01-12" },
    { id: 5, name: "David Brown", rollNumber: "10A005", class: "10-A", status: "present", lastAttendance: "2024-01-12" },
    { id: 6, name: "Emily Davis", rollNumber: "11B001", class: "11-B", status: "present", lastAttendance: "2024-01-12" },
    { id: 7, name: "Chris Miller", rollNumber: "11B002", class: "11-B", status: "absent", lastAttendance: "2024-01-10" },
    { id: 8, name: "Lisa Garcia", rollNumber: "12A001", class: "12-A", status: "present", lastAttendance: "2024-01-12" },
  ];

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === "all" || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <Check className="w-4 h-4 text-green-600" />;
      case 'absent': return <X className="w-4 h-4 text-red-600" />;
      case 'late': return <Clock className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const toggleAttendance = (studentId: number, currentStatus: string) => {
    // This would typically update the backend
    console.log(`Toggling attendance for student ${studentId} from ${currentStatus}`);
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
              <h1 className="text-3xl font-bold text-foreground">Attendance</h1>
              <p className="text-muted-foreground mt-1">Track and manage student attendance</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Mark Attendance
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">78</p>
                    <p className="text-sm text-muted-foreground">Present Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <UserX className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">17</p>
                    <p className="text-sm text-muted-foreground">Absent Today</p>
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
                    <p className="text-sm text-muted-foreground">Total Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CheckSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">82%</p>
                    <p className="text-sm text-muted-foreground">Attendance Rate</p>
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

                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-48"
                />

                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Table */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-green-600" />
                Student Attendance - {new Date(selectedDate).toLocaleDateString()}
              </CardTitle>
              <CardDescription>
                Mark attendance for your students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Attendance</TableHead>
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
                          <span className="font-medium">{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{student.rollNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.class}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(student.status)}
                          <Badge className={getStatusColor(student.status)}>
                            {student.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(student.lastAttendance).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant={student.status === 'present' ? 'default' : 'outline'}
                            onClick={() => toggleAttendance(student.id, student.status)}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={student.status === 'absent' ? 'destructive' : 'outline'}
                            onClick={() => toggleAttendance(student.id, student.status)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={student.status === 'late' ? 'secondary' : 'outline'}
                            onClick={() => toggleAttendance(student.id, student.status)}
                            className="h-8 w-8 p-0"
                          >
                            <Clock className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Class-wise Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {classes.map((cls) => (
              <Card key={cls.id} className="shadow-lg border-0 bg-white/80 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{cls.name}</CardTitle>
                  <CardDescription>{cls.students} students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Present:</span>
                      <span className="font-medium text-green-600">
                        {Math.floor(cls.students * 0.85)} ({Math.round(85)}%)
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Absent:</span>
                      <span className="font-medium text-red-600">
                        {Math.floor(cls.students * 0.15)} ({Math.round(15)}%)
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Late:</span>
                      <span className="font-medium text-yellow-600">2</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherAttendance;