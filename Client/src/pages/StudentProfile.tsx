import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Trophy, 
  Target,
  Edit,
  Camera,
  Save,
  X,
  GraduationCap,
  Clock,
  Award,
  TrendingUp,
  Users,
  FileText
} from "lucide-react";
import StudentSidebar from "@/components/StudentSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Alex Thompson",
    email: "alex.thompson@school.edu",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, City, State 12345",
    dateOfBirth: "2005-03-15",
    rollNumber: "ST2024001",
    class: "Grade 12 - Science",
    admissionDate: "2022-08-15",
    guardianName: "John Thompson",
    guardianPhone: "+1 (555) 987-6543",
    bio: "Passionate about mathematics and science. Aspiring to pursue engineering in college."
  });

  const academicStats = {
    currentGPA: 3.85,
    totalCredits: 120,
    completedCredits: 95,
    attendanceRate: 94,
    rank: 5,
    totalStudents: 150
  };

  const subjects = [
    { name: "Mathematics", grade: "A", score: 92, credits: 4, teacher: "Dr. Sarah Johnson" },
    { name: "Physics", grade: "B+", score: 87, credits: 4, teacher: "Prof. Michael Chen" },
    { name: "Chemistry", grade: "A-", score: 89, credits: 4, teacher: "Dr. Emily Davis" },
    { name: "English", grade: "A", score: 94, credits: 3, teacher: "Ms. Jennifer Wilson" },
    { name: "Computer Science", grade: "A+", score: 98, credits: 4, teacher: "Mr. David Brown" },
    { name: "Biology", grade: "B+", score: 88, credits: 4, teacher: "Dr. Lisa Anderson" }
  ];

  const achievements = [
    { title: "Mathematics Olympiad - Gold Medal", date: "2024-02-15", type: "Academic" },
    { title: "Science Fair - First Place", date: "2024-01-20", type: "Competition" },
    { title: "Perfect Attendance Award", date: "2023-12-15", type: "Attendance" },
    { title: "Student Council President", date: "2023-09-01", type: "Leadership" }
  ];

  const extracurriculars = [
    { activity: "Debate Club", role: "President", duration: "2 years" },
    { activity: "Math Club", role: "Member", duration: "3 years" },
    { activity: "Robotics Team", role: "Team Lead", duration: "1 year" },
    { activity: "Volunteer Club", role: "Active Member", duration: "2 years" }
  ];

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-50 border-green-200';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'Academic': return Trophy;
      case 'Competition': return Award;
      case 'Attendance': return Clock;
      case 'Leadership': return Users;
      default: return Trophy;
    }
  };

  const handleSave = () => {
    // Here you would typically save to backend
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data
    setIsEditing(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <StudentSidebar />
      
      <div className="flex-1">
        <DashboardHeader />
        
        <main className="p-6 space-y-6">
          {/* Profile Header */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-white/20">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback className="text-2xl bg-white/20 text-white">
                      {profileData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    size="sm" 
                    className="absolute bottom-0 right-0 rounded-full w-10 h-10 bg-white/20 hover:bg-white/30"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{profileData.name}</h1>
                      <p className="text-blue-100 text-lg mb-4">{profileData.class}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Roll: {profileData.rollNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Joined: {new Date(profileData.admissionDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          <span>Rank: #{academicStats.rank} of {academicStats.totalStudents}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setIsEditing(!isEditing)}
                      className="bg-white/20 hover:bg-white/30 border border-white/30"
                    >
                      {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 font-medium">Current GPA</p>
                    <p className="text-3xl font-bold text-green-800">{academicStats.currentGPA}</p>
                    <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      Above average
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 font-medium">Attendance</p>
                    <p className="text-3xl font-bold text-blue-800">{academicStats.attendanceRate}%</p>
                    <p className="text-sm text-blue-600">Excellent record</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 font-medium">Credits</p>
                    <p className="text-3xl font-bold text-purple-800">{academicStats.completedCredits}/{academicStats.totalCredits}</p>
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
                    <p className="text-orange-600 font-medium">Class Rank</p>
                    <p className="text-3xl font-bold text-orange-800">#{academicStats.rank}</p>
                    <p className="text-sm text-orange-600">Top 5%</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="academic">Academic Record</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Manage your personal details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={profileData.address}
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guardian">Guardian Name</Label>
                      <Input
                        id="guardian"
                        value={profileData.guardianName}
                        onChange={(e) => setProfileData({...profileData, guardianName: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guardianPhone">Guardian Phone</Label>
                      <Input
                        id="guardianPhone"
                        value={profileData.guardianPhone}
                        onChange={(e) => setProfileData({...profileData, guardianPhone: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        disabled={!isEditing}
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  {isEditing && (
                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleSave} className="gap-2">
                        <Save className="w-4 h-4" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={handleCancel} className="gap-2">
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="academic" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-green-600" />
                    Academic Performance
                  </CardTitle>
                  <CardDescription>Your grades and academic progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subjects.map((subject, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{subject.name}</p>
                            <p className="text-sm text-gray-600">{subject.teacher} • {subject.credits} Credits</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getGradeColor(subject.grade)} border`}>
                            {subject.grade}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">{subject.score}/100</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    Achievements & Awards
                  </CardTitle>
                  <CardDescription>Recognition and accomplishments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {achievements.map((achievement, index) => {
                      const Icon = getAchievementIcon(achievement.type);
                      return (
                        <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
                          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{achievement.title}</p>
                            <p className="text-sm text-gray-600">{new Date(achievement.date).toLocaleDateString()}</p>
                          </div>
                          <Badge variant="outline" className="bg-white">
                            {achievement.type}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Extracurricular Activities
                  </CardTitle>
                  <CardDescription>Clubs, sports, and other activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {extracurriculars.map((activity, index) => (
                      <div key={index} className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{activity.activity}</p>
                            <p className="text-sm text-gray-600">{activity.role}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">Duration: {activity.duration}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default StudentProfile;