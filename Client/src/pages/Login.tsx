import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user.role.toLowerCase() === role?.toLowerCase()) {
          login(data.user, data.token);
          toast({
            title: "Login successful",
            description: `Welcome back, ${data.user.name}!`,
          });
          const dashboardRoute = `/${role?.toLowerCase()}-dashboard`;
          navigate(dashboardRoute);
        } else {
          toast({
            title: "Access denied",
            description: `You don't have ${role} privileges.`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Login failed",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = () => {
    switch (role?.toLowerCase()) {
      case "student": return "from-blue-500 to-blue-600";
      case "teacher": return "from-green-500 to-green-600";
      case "admin": return "from-purple-500 to-purple-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${getRoleColor()} flex items-center justify-center`}>
              <span className="text-2xl font-bold text-white">
                {role?.charAt(0).toUpperCase()}
              </span>
            </div>
            <CardTitle className="text-2xl font-bold">
              {role?.charAt(0).toUpperCase() + role?.slice(1)} Login
            </CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
            {role === 'admin' && (
              <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                Sample: admin@school.com / admin123
              </div>
            )}
            {role === 'teacher' && (
              <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                Sample: sarah@school.com / teacher123
              </div>
            )}
            {role === 'student' && (
              <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                Sample: alex.thompson@student.school.com / student123
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Link
                  to={`/forgot-password/${role}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className={`w-full bg-gradient-to-r ${getRoleColor()} hover:opacity-90 text-white`}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>


            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;