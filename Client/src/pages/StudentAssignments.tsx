import { useState, useEffect } from "react";
import { 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  Download, 
  Eye,
  Filter,
  Search,
  Plus,
  BookOpen,
  User,
  Flag,
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react";
import StudentSidebar from "@/components/StudentSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { studentAPI } from '@/lib/api';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        // First get current student data
        const studentResponse = await studentAPI.getCurrentStudent();
        const studentId = studentResponse.data.student.id;
        
        // Then get assignments for this student
        const assignmentsResponse = await studentAPI.getStudentAssignments(studentId);
        const apiAssignments = (assignmentsResponse.data.data || []).map(assignment => ({
          id: assignment.id,
          title: assignment.title,
          subject: assignment.teacherClassSubject?.subject?.name || 'Unknown',
          teacher: assignment.teacherClassSubject?.teacher?.user?.name || 'Unknown',
          dueDate: assignment.dueDate,
          assignedDate: assignment.createdAt,
          status: assignment.submissions?.length > 0 ? 'submitted' : 'pending',
          priority: 'medium',
          progress: assignment.submissions?.length > 0 ? 100 : 0,
          maxScore: 100,
          description: assignment.description || 'No description available',
          attachments: [],
          submissionType: 'file',
          estimatedTime: '2 hours',
          score: assignment.submissions?.[0]?.grade || null
        }));
        
        setAssignments(apiAssignments.length > 0 ? apiAssignments : mockAssignments);
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
        setAssignments(mockAssignments);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const mockAssignments = [
    {
      id: 1,
      title: "Calculus Problem Set - Chapter 5",
      subject: "Mathematics",
      teacher: "Dr. Sarah Johnson",
      dueDate: "2024-01-25",
      assignedDate: "2024-01-18",
      status: "pending",
      priority: "high",
      progress: 60,
      maxScore: 100,
      description: "Solve problems 1-20 from Chapter 5: Derivatives and Applications",
      attachments: ["calculus_problems.pdf", "formula_sheet.pdf"],
      submissionType: "file",
      estimatedTime: "3 hours"
    },
    {
      id: 2,
      title: "Lab Report - Motion Analysis",
      subject: "Physics",
      teacher: "Prof. Michael Chen",
      dueDate: "2024-01-28",
      assignedDate: "2024-01-20",
      status: "in-progress",
      priority: "medium",
      progress: 30,
      maxScore: 50,
      description: "Analyze the motion data collected in Lab 3 and write a comprehensive report",
      attachments: ["lab_data.xlsx", "report_template.docx"],
      submissionType: "file",
      estimatedTime: "4 hours"
    },
    {
      id: 3,
      title: "Essay on Modern Literature",
      subject: "English",
      teacher: "Ms. Jennifer Wilson",
      dueDate: "2024-02-02",
      assignedDate: "2024-01-22",
      status: "not-started",
      priority: "low",
      progress: 0,
      maxScore: 75,
      description: "Write a 1500-word essay analyzing themes in contemporary literature",
      attachments: ["essay_guidelines.pdf", "reading_list.pdf"],
      submissionType: "text",
      estimatedTime: "5 hours"
    },
    {
      id: 4,
      title: "Chemical Reactions Quiz",
      subject: "Chemistry",
      teacher: "Dr. Emily Davis",
      dueDate: "2024-01-24",
      assignedDate: "2024-01-22",
      status: "submitted",
      priority: "medium",
      progress: 100,
      maxScore: 25,
      score: 23,
      description: "Online quiz covering Chapter 8: Chemical Reactions and Equations",
      attachments: [],
      submissionType: "online",
      estimatedTime: "1 hour"
    },
    {
      id: 5,
      title: "Programming Project - Web App",
      subject: "Computer Science",
      teacher: "Mr. David Brown",
      dueDate: "2024-02-10",
      assignedDate: "2024-01-15",
      status: "in-progress",
      priority: "high",
      progress: 75,
      maxScore: 150,
      description: "Build a full-stack web application using React and Node.js",
      attachments: ["project_requirements.pdf", "starter_code.zip"],
      submissionType: "link",
      estimatedTime: "20 hours"
    }
  ];

  const subjects = ["Mathematics", "Physics", "English", "Chemistry", "Computer Science"];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'not-started': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return CheckCircle;
      case 'in-progress': return Clock;
      case 'pending': return AlertCircle;
      case 'not-started': return FileText;
      case 'overdue': return AlertCircle;
      default: return FileText;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === "all" || assignment.subject === filterSubject;
    const matchesStatus = filterStatus === "all" || assignment.status === filterStatus;
    
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'subject':
        return a.subject.localeCompare(b.subject);
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
      default:
        return 0;
    }
  });

  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => a.status === 'pending' || a.status === 'not-started').length,
    inProgress: assignments.filter(a => a.status === 'in-progress').length,
    submitted: assignments.filter(a => a.status === 'submitted').length,
    overdue: assignments.filter(a => getDaysUntilDue(a.dueDate) < 0 && a.status !== 'submitted').length
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <StudentSidebar />
      
      <div className="flex-1">
        <DashboardHeader />
        
        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
              <p className="text-gray-600 mt-1">Track and manage your academic assignments</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700">
                <Plus className="w-4 h-4" />
                Submit Assignment
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 font-medium text-sm">Total</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-600 font-medium text-sm">Pending</p>
                    <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 font-medium text-sm">In Progress</p>
                    <p className="text-2xl font-bold text-purple-800">{stats.inProgress}</p>
                  </div>
                  <Edit className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 font-medium text-sm">Submitted</p>
                    <p className="text-2xl font-bold text-green-800">{stats.submitted}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 font-medium text-sm">Overdue</p>
                    <p className="text-2xl font-bold text-red-800">{stats.overdue}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search assignments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Filter by subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dueDate">Due Date</SelectItem>
                    <SelectItem value="subject">Subject</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Assignments List */}
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
                      <div className="w-20 h-8 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedAssignments.map((assignment) => {
              const StatusIcon = getStatusIcon(assignment.status);
              const daysUntilDue = getDaysUntilDue(assignment.dueDate);
              const isOverdue = daysUntilDue < 0 && assignment.status !== 'submitted';
              
              return (
                <Card key={assignment.id} className={`border-0 shadow-lg bg-white/80 backdrop-blur transition-all hover:shadow-xl ${
                  isOverdue ? 'border-l-4 border-l-red-500' : ''
                }`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Assignment Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <StatusIcon className="w-6 h-6 text-white" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg">{assignment.title}</h3>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <BookOpen className="w-4 h-4" />
                                    <span>{assignment.subject}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    <span>{assignment.teacher}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{assignment.estimatedTime}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem className="gap-2">
                                    <Eye className="w-4 h-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2">
                                    <Upload className="w-4 h-4" />
                                    Submit Work
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="gap-2">
                                    <Download className="w-4 h-4" />
                                    Download Files
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            <p className="text-gray-600 mt-2 text-sm">{assignment.description}</p>
                            
                            {/* Progress Bar */}
                            {assignment.status !== 'not-started' && (
                              <div className="mt-3">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600">Progress</span>
                                  <span className="font-medium">{assignment.progress}%</span>
                                </div>
                                <Progress value={assignment.progress} className="h-2" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status and Due Date */}
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2">
                          <Flag className={`w-4 h-4 ${getPriorityColor(assignment.priority)}`} />
                          <Badge className={`${getStatusColor(assignment.status)} border`}>
                            {assignment.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>
                          <p className={`text-xs ${
                            isOverdue ? 'text-red-600' : 
                            daysUntilDue <= 1 ? 'text-yellow-600' : 'text-gray-500'
                          }`}>
                            {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` :
                             daysUntilDue === 0 ? 'Due today' :
                             daysUntilDue === 1 ? 'Due tomorrow' :
                             `${daysUntilDue} days left`}
                          </p>
                        </div>

                        {assignment.status === 'submitted' && assignment.score && (
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-600">
                              Score: {assignment.score}/{assignment.maxScore}
                            </p>
                            <p className="text-xs text-gray-500">
                              {Math.round((assignment.score / assignment.maxScore) * 100)}%
                            </p>
                          </div>
                        )}

                        {assignment.attachments.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <FileText className="w-3 h-3" />
                            <span>{assignment.attachments.length} file(s)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            </div>
          )}

          {!loading && sortedAssignments.length === 0 && (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentAssignments;