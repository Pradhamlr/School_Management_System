import { useState } from "react";
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
  Download
} from "lucide-react";
import { TeacherSidebar } from "@/components/TeacherSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const TeacherAssignments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const assignments = [
    {
      id: 1,
      title: "Quadratic Equations Practice",
      subject: "Mathematics",
      class: "10-A",
      dueDate: "2024-01-15",
      createdDate: "2024-01-08",
      totalStudents: 25,
      submitted: 18,
      graded: 12,
      status: "active",
      priority: "medium"
    },
    {
      id: 2,
      title: "Newton's Laws Lab Report",
      subject: "Physics",
      class: "11-B",
      dueDate: "2024-01-20",
      createdDate: "2024-01-10",
      totalStudents: 20,
      submitted: 8,
      graded: 0,
      status: "active",
      priority: "high"
    },
    {
      id: 3,
      title: "Chemical Bonding Essay",
      subject: "Chemistry",
      class: "12-A",
      dueDate: "2024-01-12",
      createdDate: "2024-01-05",
      totalStudents: 28,
      submitted: 28,
      graded: 25,
      status: "completed",
      priority: "low"
    },
    {
      id: 4,
      title: "Algebra Word Problems",
      subject: "Mathematics",
      class: "9-C",
      dueDate: "2024-01-18",
      createdDate: "2024-01-11",
      totalStudents: 22,
      submitted: 5,
      graded: 0,
      status: "active",
      priority: "medium"
    }
  ];

  const filteredAssignments = assignments.filter(assignment => 
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
            <Button className="bg-green-600 hover:bg-green-700">
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
                    <p className="text-2xl font-bold">{assignments.length}</p>
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
                    <p className="text-2xl font-bold">59</p>
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
                    <p className="text-2xl font-bold">37</p>
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
                    <p className="text-2xl font-bold">3</p>
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
              {/* Assignments List */}
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
                                <Progress value={(assignment.submitted / assignment.totalStudents) * 100} className="flex-1" />
                                <span className="text-sm font-medium">{assignment.submitted}/{assignment.totalStudents}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Graded</p>
                              <div className="flex items-center gap-2">
                                <Progress value={(assignment.graded / assignment.submitted) * 100} className="flex-1" />
                                <span className="text-sm font-medium">{assignment.graded}/{assignment.submitted}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Completion</p>
                              <div className="flex items-center gap-2">
                                <Progress value={(assignment.submitted / assignment.totalStudents) * 100} className="flex-1" />
                                <span className="text-sm font-medium">{Math.round((assignment.submitted / assignment.totalStudents) * 100)}%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="active">
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
            </TabsContent>

            <TabsContent value="completed">
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
    </div>
  );
};

export default TeacherAssignments;