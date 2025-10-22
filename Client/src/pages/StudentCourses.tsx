import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Calculator, 
  Atom, 
  Globe, 
  Palette, 
  Music, 
  Dumbbell, 
  Languages, 
  Microscope, 
  Computer,
  PenTool,
  Beaker,
  MapPin,
  Users,
  Brain,
  Lightbulb
} from "lucide-react";
import StudentSidebar from "@/components/StudentSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { subjectAPI } from '@/lib/api';

const StudentCourses = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await subjectAPI.getSubjects();
        setSubjects(response.data.subjects || []);
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const getSubjectIcon = (subjectName: string) => {
    const name = subjectName.toLowerCase();
    
    if (name.includes('math') || name.includes('algebra') || name.includes('geometry') || name.includes('calculus')) {
      return { icon: Calculator, gradient: 'from-blue-500 to-indigo-600' };
    }
    if (name.includes('english') || name.includes('literature') || name.includes('language')) {
      return { icon: PenTool, gradient: 'from-green-500 to-emerald-600' };
    }
    if (name.includes('physics')) {
      return { icon: Atom, gradient: 'from-purple-500 to-violet-600' };
    }
    if (name.includes('chemistry')) {
      return { icon: Beaker, gradient: 'from-orange-500 to-red-600' };
    }
    if (name.includes('computer') || name.includes('programming') || name.includes('coding') || name === 'computer') {
      return { icon: Computer, gradient: 'from-gray-700 to-gray-900' };
    }
    if (name.includes('biology') || name.includes('science')) {
      return { icon: Microscope, gradient: 'from-teal-500 to-cyan-600' };
    }
    if (name.includes('history')) {
      return { icon: Globe, gradient: 'from-amber-500 to-yellow-600' };
    }
    if (name.includes('geography')) {
      return { icon: Globe, gradient: 'from-emerald-500 to-green-600' };
    }
    if (name.includes('art') || name.includes('drawing')) {
      return { icon: Palette, gradient: 'from-pink-500 to-rose-600' };
    }
    if (name.includes('music')) {
      return { icon: Music, gradient: 'from-violet-500 to-purple-600' };
    }
    if (name.includes('physical') || name.includes('sports') || name.includes('pe')) {
      return { icon: Dumbbell, gradient: 'from-red-500 to-pink-600' };
    }
    if (name.includes('psychology') || name.includes('philosophy')) {
      return { icon: Brain, gradient: 'from-indigo-500 to-blue-600' };
    }
    if (name.includes('economics') || name.includes('business')) {
      return { icon: Users, gradient: 'from-slate-600 to-gray-700' };
    }
    
    // Default icon
    return { icon: BookOpen, gradient: 'from-blue-500 to-purple-500' };
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <StudentSidebar />
      
      <div className="flex-1">
        <DashboardHeader />
        
        <main className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
              <p className="text-gray-600 mt-1">Track your enrolled courses and progress</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map((i) => (
                <Card key={i} className="border-0 shadow-lg bg-white/80 backdrop-blur animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <Card key={subject.id} className="border-0 shadow-lg bg-white/80 backdrop-blur hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      {(() => {
                        const { icon: SubjectIcon, gradient } = getSubjectIcon(subject.name);
                        return (
                          <div className={`w-16 h-16 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                            <SubjectIcon className="w-8 h-8 text-white" />
                          </div>
                        );
                      })()}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{subject.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">Code: {subject.code}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentCourses;