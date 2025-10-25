import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});
    // basic client-side validation to avoid unnecessary requests
    const errs: { email?: string; password?: string } = {};
    if (!formData.email || !formData.email.includes('@')) errs.email = 'Please enter a valid email address';
    if (!formData.password || formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setLoading(true);

    try {
      const res = await api.post('/api/auth/login', formData);
      const data = res.data;

        if (res.status >= 200 && res.status < 300) {
        if (data.user.role.toLowerCase() === role?.toLowerCase()) {
            // call login and wait for state to update before navigating
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
          // show persistent inline error for common failure path
          setErrorMessage(data.message || 'Invalid credentials');
          toast({ title: 'Login failed', description: data.message || 'Invalid credentials', variant: 'destructive' });
      }
    } catch (error) {
      const serverMessage = (error as any)?.response?.data?.message || (error as any)?.message || 'Something went wrong. Please try again.';
      // persist server message in an inline alert so it doesn't flash
      setErrorMessage(serverMessage);
      toast({ title: 'Login failed', description: serverMessage, variant: 'destructive' });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="shadow-xl dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${getRoleColor()} flex items-center justify-center`}>
              <span className="text-2xl font-bold text-white">
                {role?.charAt(0).toUpperCase()}
              </span>
            </div>
            <CardTitle className="text-2xl font-bold dark:text-white">
              {role?.charAt(0).toUpperCase() + role?.slice(1)} Login
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              Enter your credentials to access your account
            </CardDescription>
            {role === 'admin' && (
              <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                Sample: admin@school.test / AdminPass123!
              </div>
            )}
            {role === 'teacher' && (
              <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                Sample: teacher1@school.test / TeacherPass1!
              </div>
            )}
            {role === 'student' && (
              <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                Sample: student1@school.test / StudentPass1!
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-gray-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                {fieldErrors.email && (
                  <p role="alert" className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="dark:text-gray-200">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                    {fieldErrors.password && (
                      <p role="alert" className="text-sm text-red-600 mt-1">{fieldErrors.password}</p>
                    )}
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
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
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

              {/* inline persistent error area */}
              {errorMessage && (
                <div role="alert" className="mt-3 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
                  <strong className="block font-semibold">Login error</strong>
                  <p className="text-sm">{errorMessage}</p>
                </div>
              )}


            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;