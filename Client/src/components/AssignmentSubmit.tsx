import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Plus } from 'lucide-react';
import { assignmentAPI, studentAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Assignment {
  id: number;
  title: string;
  subject: string;
  dueDate: string;
  status: string;
}

interface AssignmentSubmitProps {
  assignments: Assignment[];
  onSubmitted?: () => void;
}

const AssignmentSubmit = ({ assignments, onSubmitted }: AssignmentSubmitProps) => {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const pendingAssignments = assignments.filter(a => a.status === 'pending' || a.status === 'not-started');

  const handleSubmit = async () => {
    if (!selectedAssignmentId) {
      toast({
        title: "Error",
        description: "Please select an assignment to submit",
        variant: "destructive",
      });
      return;
    }

    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const studentResponse = await studentAPI.getCurrentStudent();
      const studentId = studentResponse.data.student.id;
      const assignmentId = parseInt(selectedAssignmentId);

      await assignmentAPI.submitAssignmentWithFile(assignmentId, studentId, file, remarks);

      toast({
        title: "Success",
        description: "Assignment submitted successfully!",
      });

      setFile(null);
      setRemarks('');
      setSelectedAssignmentId('');
      setOpen(false);
      onSubmitted?.();
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit assignment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Submit Assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Submit Assignment
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Assignment</label>
            <Select value={selectedAssignmentId} onValueChange={setSelectedAssignmentId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an assignment to submit" />
              </SelectTrigger>
              <SelectContent>
                {pendingAssignments.map((assignment) => (
                  <SelectItem key={assignment.id} value={assignment.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{assignment.title}</span>
                      <span className="text-xs text-gray-500">
                        {assignment.subject} • Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {pendingAssignments.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">No pending assignments to submit</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Upload File *</label>
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.txt,.jpg,.png"
              required
            />
            {file && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                {file.name}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Remarks (Optional)</label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any comments about your submission..."
              rows={3}
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={loading || !selectedAssignmentId || !file}
            className="w-full"
          >
            {loading ? 'Submitting...' : 'Submit Assignment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentSubmit;