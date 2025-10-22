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
import { studentAPI, subjectAPI } from '@/lib/api';
import AssignmentSubmit from '@/components/AssignmentSubmit';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDueDate, setFilterDueDate] = useState("all");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        // First get current student data
        const studentResponse = await studentAPI.getCurrentStudent();
        const studentId = studentResponse.data.student.id;

        // Get subjects from API
        const subjectsResponse = await subjectAPI.getSubjects();
        setSubjects(subjectsResponse.data.subjects || []);

        // Then get assignments for this student
        const assignmentsResponse = await studentAPI.getStudentAssignments(studentId);
        const apiAssignments = (assignmentsResponse.data.data || []).map(assignment => {
          const submission = assignment.submissions?.[0];
          const status = submission ? submission.status.toLowerCase() : 'pending';
          
          return {
            id: assignment.id,
            title: assignment.title,
            subject: assignment.teacherClassSubject?.subject?.name || 'Unknown',
            teacher: assignment.teacherClassSubject?.teacher?.user?.name || 'Unknown',
            dueDate: assignment.dueDate,
            assignedDate: assignment.createdAt,
            status: status,
            priority: 'medium',
            progress: status === 'submitted' || status === 'graded' ? 100 : 0,
            maxScore: 100,
            description: assignment.description || 'No description available',
            attachments: [],
            submissionType: 'file',
            estimatedTime: '2 hours',
            score: submission?.grade || null
          };
        });
        
        setAssignments(apiAssignments);
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
        // If student profile is missing (404), show an actionable message in UI
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  

  // subjects is already fetched from API in useEffect
  
  const getDueDateLabel = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
    
    if (due.toDateString() === today.toDateString()) return 'Today';
    if (due.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    if (due >= thisWeekStart && due <= thisWeekEnd) return 'This Week';
    return due.toLocaleDateString();
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'graded': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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
      case 'submitted': return Upload;
      case 'graded': return CheckCircle;
      case 'pending': return AlertCircle;
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
    
    let matchesDueDate = true;
    if (filterDueDate !== "all") {
      const due = new Date(assignment.dueDate);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());
      const thisWeekEnd = new Date(thisWeekStart);
      thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
      
      if (filterDueDate === "today") {
        matchesDueDate = due.toDateString() === today.toDateString();
      } else if (filterDueDate === "tomorrow") {
        matchesDueDate = due.toDateString() === tomorrow.toDateString();
      } else if (filterDueDate === "thisweek") {
        matchesDueDate = due >= thisWeekStart && due <= thisWeekEnd;
      }
    }
    
    return matchesSearch && matchesSubject && matchesStatus && matchesDueDate;
  });

  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    submitted: assignments.filter(a => a.status === 'submitted').length,
    graded: assignments.filter(a => a.status === 'graded').length,
    overdue: assignments.filter(a => getDaysUntilDue(a.dueDate) < 0 && a.status === 'pending').length
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
            <div className="flex gap-3 items-center">
              <AssignmentSubmit assignments={assignments} onSubmitted={async () => {
                // refresh assignments list after submission
                try {
                  setLoading(true);
                  const studentResponse = await studentAPI.getCurrentStudent();
                  const studentId = studentResponse.data.student.id;
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
                  setAssignments(apiAssignments);
                } catch (error) {
                  console.error('Failed to refresh assignments after submit', error);
                } finally {
                  setLoading(false);
                }
              }} />
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

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 font-medium text-sm">Submitted</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.submitted}</p>
                  </div>
                  <Upload className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 font-medium text-sm">Graded</p>
                    <p className="text-2xl font-bold text-green-800">{stats.graded}</p>
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
                      <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="graded">Graded</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterDueDate} onValueChange={setFilterDueDate}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Due Dates" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Due Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="thisweek">This Week</SelectItem>
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
                            Due: {getDueDateLabel(assignment.dueDate)}
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

                        {assignment.status === 'graded' && assignment.score && (
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