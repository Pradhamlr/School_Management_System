import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const QuickLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleQuickLogin = async (email: string, password: string, role: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user, token } = response.data;
      
      login(user, token);
      toast({
        title: "Login successful",
        description: `Welcome, ${user.name}!`,
      });
      
      navigate(`/${role.toLowerCase()}-dashboard`);
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Quick Login (Test Accounts)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={() => handleQuickLogin('student1@school.test', 'StudentPass1!', 'student')}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Login as Student (student1@school.test)
        </Button>
        <Button 
          onClick={() => handleQuickLogin('teacher1@school.test', 'TeacherPass1!', 'teacher')}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          Login as Teacher (teacher1@school.test)
        </Button>
        <Button 
          onClick={() => handleQuickLogin('admin@school.test', 'AdminPass123!', 'admin')}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          Login as Admin (admin@school.test)
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickLogin;