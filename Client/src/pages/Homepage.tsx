import { GraduationCap, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Homepage = () => {
  const navigate = useNavigate();

  const roles = [
    {
      title: "Student",
      description: "Access your courses, assignments, and grades",
      icon: GraduationCap,
      color: "from-blue-500 to-blue-600",
      path: "/login/student"
    },
    {
      title: "Teacher", 
      description: "Manage classes, assignments, and student progress",
      icon: Users,
      color: "from-green-500 to-green-600", 
      path: "/login/teacher"
    },
    {
      title: "Admin",
      description: "Full system access and management",
      icon: Shield,
      color: "from-purple-500 to-purple-600",
      path: "/login/admin"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-800 mb-4">
            ClassLinker
          </h1>
          <p className="text-xl text-slate-600">
            Educational Institute Management System
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.title}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-8 text-center"
              >
                <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${role.color} flex items-center justify-center`}>
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-800 mb-3">
                  {role.title}
                </h3>
                <p className="text-slate-600 mb-6">
                  {role.description}
                </p>
                <Button
                  onClick={() => navigate(role.path)}
                  className={`w-full bg-gradient-to-r ${role.color} hover:opacity-90 text-white font-medium py-3 rounded-xl transition-all duration-200`}
                >
                  Login as {role.title}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Homepage;