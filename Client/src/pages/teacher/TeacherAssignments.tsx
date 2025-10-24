import { useState, useEffect } from "react";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  DownloadCloud,
  Loader2,
  GraduationCap
} from "lucide-react";
import { TeacherSidebar } from "@/components/TeacherSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { CreateAssignmentModal } from "@/components/CreateAssignmentModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import api from '@/lib/api';

const TeacherAssignments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, submissions: 0, graded: 0, active: 0 });
  const [teacherAnalytics, setTeacherAnalytics] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [gradeData, setGradeData] = useState([]);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradingSubmissions, setGradingSubmissions] = useState({});
  const [editData, setEditData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const { toast } = useToast();

  const handleView = async (assignmentId: number) => {
    try {
      const response = await api.get(`/api/assignments/${assignmentId}`);
      setViewData(response.data.data);
      setShowViewModal(true);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch assignment details", variant: "destructive" });
    }
  };

  const handleEdit = async (assignmentId: number) => {
    try {
      const response = await api.get(`/api/assignments/${assignmentId}`);
      const assignment = response.data.data;
      setEditData(assignment);
      setEditTitle(assignment.title);
      setEditDescription(assignment.description || "");
      setEditDueDate(new Date(assignment.dueDate).toISOString().slice(0, 16));
      setShowEditModal(true);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch assignment details", variant: "destructive" });
    }
  };

  const handleEditSubmit = async () => {
    try {
      await api.put(`/api/assignments/${editData.id}`, {
        title: editTitle,
        description: editDescription,
        dueDate: editDueDate
      });
      toast({ title: "Success", description: "Assignment updated successfully" });
      setShowEditModal(false);
      fetchAssignments();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update assignment", variant: "destructive" });
    }
  };

  const handleExport = async (assignmentId: number) => {
    try {
      const response = await api.get(`/api/assignments/${assignmentId}/stats`);
      const stats = response.data.data;
      const csvContent = `Assignment,Class,Total Students,Submitted,Graded,Submission Rate,Grading Rate\n${stats.assignmentTitle},${stats.class}-${stats.section},${stats.totalStudents},${stats.submitted},${stats.graded},${stats.submissionRate}%,${stats.gradingRate}%`;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${stats.assignmentTitle}_stats.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({ title: "Error", description: "Failed to export assignment", variant: "destructive" });
    }
  };

  const handleDelete = async (assignmentId: number) => {
    try {
      await api.delete(`/api/assignments/${assignmentId}`);
      toast({ title: "Success", description: "Assignment deleted successfully" });
      fetchAssignments();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete assignment", variant: "destructive" });
    }
  };

  const handleGrade = async (assignmentId: number) => {
    try {
      const response = await api.get('/api/assignments/submissions', {
        params: { assignmentId }
      });
      setGradeData(response.data.data);
      setShowGradeModal(true);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch submissions", variant: "destructive" });
    }
  };

  const handleGradeSubmission = async (submissionId: number, grade: string, remarks: string) => {
    try {
      await api.put(`/api/assignments/submissions/${submissionId}/grade`, {
        grade,
        remarks
      });
      toast({ title: "Success", description: "Submission graded successfully" });
      
      // Update local state
      setGradeData(prev => prev.map(sub => 
        sub.id === submissionId 
          ? { ...sub, grade, remarks, status: 'GRADED' }
          : sub
      ));
      
      // Clear grading inputs
      setGradingSubmissions(prev => {
        const updated = { ...prev };
        delete updated[submissionId];
        return updated;
      });
      
      fetchAssignments();
    } catch (error) {
      toast({ title: "Error", description: "Failed to grade submission", variant: "destructive" });
    }
  };

  const updateGradingInput = (submissionId: number, field: string, value: string) => {
    setGradingSubmissions(prev => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: value
      }
    }));
  };

  useEffect(() => {
    fetchAssignments();
    // fetch teacher analytics for consistent assignment counts
    const fetchTeacherAnalytics = async () => {
      try {
        const res = await api.get('/api/analytics/teacher');
        setTeacherAnalytics(res.data.data || null);
      } catch (e) {
        // ignore
      }
    };
    fetchTeacherAnalytics();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/assignments');
      const assignmentsData = response.data.data || [];
      setAssignments(assignmentsData);
      
      const totalSubmissions = assignmentsData.reduce((sum, assignment) => 
        sum + (assignment.submissions?.length || 0), 0);
      const totalGraded = assignmentsData.reduce((sum, assignment) => 
        sum + (assignment.submissions?.filter(s => s.status === 'GRADED').length || 0), 0);
      const activeCount = assignmentsData.filter(a => 
        new Date(a.dueDate) > new Date()).length;
      
      setStats({ total: assignmentsData.length, submissions: totalSubmissions, graded: totalGraded, active: activeCount });
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({ title: "Error", description: "Failed to fetch assignments", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };



  const processedAssignments = assignments.map(assignment => {
    const submitted = assignment.submissions?.length || 0;
    const graded = assignment.submissions?.filter(s => s.status === 'GRADED').length || 0;
    const totalStudents = submitted; // Use actual submissions as total for now
    const isOverdue = new Date(assignment.dueDate) < new Date();
    const isCompleted = graded === submitted && submitted > 0;
    
    return {
      ...assignment,
      totalStudents,
      submitted,
      graded,
      status: isOverdue ? 'overdue' : isCompleted ? 'completed' : 'active',
      subject: assignment.teacherClassSubject?.subject?.name || 'Unknown',
      class: `${assignment.teacherClassSubject?.class?.name || 'Unknown'}-${assignment.teacherClassSubject?.class?.section || ''}`,
      priority: isOverdue ? 'high' : graded < submitted * 0.5 ? 'medium' : 'low'
    };
  });

  const filteredAssignments = processedAssignments.filter(assignment => 
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TeacherSidebar />
      
      <div className="flex-1">
        <DashboardHeader />
        
        <main className="p-8 space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Assignments</h1>
              <p className="text-muted-foreground mt-1">Create and manage assignments for your classes</p>
            </div>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (teacherAnalytics?.assignmentsCount ?? stats.total)}</p>
                    <p className="text-sm text-muted-foreground">Total Assignments</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.submissions}</p>
                    <p className="text-sm text-muted-foreground">Submissions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.graded}</p>
                    <p className="text-sm text-muted-foreground">Graded</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.active}</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Assignments</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="ml-2">Loading assignments...</span>
                </div>
              ) : filteredAssignments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Assignments Found</h3>
                  <p className="text-muted-foreground">Create your first assignment to get started</p>
                </div>
              ) : (
              <div className="space-y-4">
                {filteredAssignments.map((assignment) => (
                  <Card key={assignment.id} className="shadow-lg border-0 bg-white/80 backdrop-blur hover:shadow-xl transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">{assignment.title}</h3>
                            <Badge className={getStatusColor(assignment.status)}>
                              {assignment.status}
                            </Badge>
                            <div className={`flex items-center gap-1 ${getPriorityColor(assignment.priority)}`}>
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm font-medium capitalize">{assignment.priority}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{assignment.class}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              <span>{assignment.subject}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Submissions</p>
                              <div className="flex items-center gap-2">
                                <Progress value={100} className="flex-1" />
                                <span className="text-sm font-medium">{assignment.submitted}/{assignment.submitted}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Graded</p>
                              <div className="flex items-center gap-2">
                                <Progress value={assignment.submitted > 0 ? (assignment.graded / assignment.submitted) * 100 : 0} className="flex-1" />
                                <span className="text-sm font-medium">{assignment.graded}/{assignment.submitted}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Grading Rate</p>
                              <div className="flex items-center gap-2">
                                <Progress value={assignment.submitted > 0 ? (assignment.graded / assignment.submitted) * 100 : 0} className="flex-1" />
                                <span className="text-sm font-medium">{assignment.submitted > 0 ? Math.round((assignment.graded / assignment.submitted) * 100) : 0}%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="outline" size="sm" onClick={() => handleView(assignment.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(assignment.id)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleGrade(assignment.id)}>
                            <GraduationCap className="w-4 h-4 mr-2" />
                            Grade
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleExport(assignment.id)}>
                            <DownloadCloud className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{assignment.title}"? This action cannot be undone and will also delete all submissions.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(assignment.id)} className="bg-red-600 hover:bg-red-700">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              )}
            </TabsContent>

            <TabsContent value="active">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
              <div className="space-y-4">
                {filteredAssignments.filter(a => a.status === 'active').map((assignment) => (
                  <Card key={assignment.id} className="shadow-lg border-0 bg-white/80 backdrop-blur">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-2">{assignment.title}</h3>
                      <p className="text-muted-foreground">{assignment.class} - Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
              <div className="space-y-4">
                {filteredAssignments.filter(a => a.status === 'completed').map((assignment) => (
                  <Card key={assignment.id} className="shadow-lg border-0 bg-white/80 backdrop-blur">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-2">{assignment.title}</h3>
                      <p className="text-muted-foreground">{assignment.class} - Completed</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              )}
            </TabsContent>

            <TabsContent value="overdue">
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Overdue Assignments</h3>
                <p className="text-muted-foreground">Great job keeping up with deadlines!</p>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      <CreateAssignmentModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={fetchAssignments}
      />
      
      {/* View Assignment Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assignment Details</DialogTitle>
            <DialogDescription>View assignment information</DialogDescription>
          </DialogHeader>
          {viewData && (
            <div className="space-y-4">
              <div><strong>Title:</strong> {viewData.title}</div>
              <div><strong>Description:</strong> {viewData.description || 'No description'}</div>
              <div><strong>Due Date:</strong> {new Date(viewData.dueDate).toLocaleDateString()}</div>
              <div><strong>Subject:</strong> {viewData.teacherClassSubject?.subject?.name}</div>
              <div><strong>Class:</strong> {viewData.teacherClassSubject?.class?.name}-{viewData.teacherClassSubject?.class?.section}</div>
              <div><strong>Submissions:</strong> {viewData.submissions?.length || 0}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Grade Submissions Modal */}
      <Dialog open={showGradeModal} onOpenChange={setShowGradeModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Grade Submissions</DialogTitle>
            <DialogDescription>Review and grade student submissions</DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {gradeData.length === 0 ? (
              <p>No submissions found for this assignment.</p>
            ) : (
              <div className="space-y-4">
                {gradeData.map((submission) => (
                  <div key={submission.id} className="border p-4 rounded bg-white">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div><strong>Student:</strong> {submission.student?.user?.name}</div>
                        <div><strong>Status:</strong> <Badge className={submission.status === 'GRADED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{submission.status}</Badge></div>
                        <div><strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleDateString()}</div>
                        {submission.fileUrl && <div><strong>File:</strong> <a href={submission.fileUrl} target="_blank" className="text-blue-600 hover:underline">View File</a></div>}
                      </div>
                      <div>
                        {submission.status === 'GRADED' ? (
                          <div>
                            <div><strong>Grade:</strong> {submission.grade}</div>
                            <div><strong>Remarks:</strong> {submission.remarks}</div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium">Grade:</label>
                              <Input
                                placeholder="Enter grade (e.g., A+, 85, B)"
                                value={gradingSubmissions[submission.id]?.grade || ''}
                                onChange={(e) => updateGradingInput(submission.id, 'grade', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Remarks:</label>
                              <Input
                                placeholder="Enter feedback/remarks"
                                value={gradingSubmissions[submission.id]?.remarks || ''}
                                onChange={(e) => updateGradingInput(submission.id, 'remarks', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <Button
                              onClick={() => handleGradeSubmission(
                                submission.id,
                                gradingSubmissions[submission.id]?.grade || '',
                                gradingSubmissions[submission.id]?.remarks || ''
                              )}
                              disabled={!gradingSubmissions[submission.id]?.grade}
                              className="bg-green-600 hover:bg-green-700 w-full"
                              size="sm"
                            >
                              <GraduationCap className="w-4 h-4 mr-2" />
                              Grade Submission
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Assignment Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              ✨ Edit Assignment
            </DialogTitle>
            <DialogDescription className="text-lg">
              Update your assignment details with style!
            </DialogDescription>
          </DialogHeader>
          {editData && (
            <div className="space-y-6 p-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-green-700">📝 Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                  placeholder="Enter assignment title..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-green-700">📄 Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 resize-none"
                  placeholder="Describe your assignment..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-green-700">📅 Due Date</label>
                <input
                  type="datetime-local"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full p-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleEditSubmit}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  ✅ Update Assignment
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 border-2 border-gray-300 hover:border-gray-400 py-3 rounded-lg transition-all duration-200"
                >
                  ❌ Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherAssignments;