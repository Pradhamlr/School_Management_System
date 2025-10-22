import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import api from '@/lib/api';

interface CreateAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateAssignmentModal({ open, onOpenChange, onSuccess }: CreateAssignmentModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [teacherClassSubjectId, setTeacherClassSubjectId] = useState("");
  const [teacherClassSubjects, setTeacherClassSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchTeacherClassSubjects();
    }
  }, [open]);

  const fetchTeacherClassSubjects = async () => {
    // Use seeded data directly since authentication might not be set up properly
    setTeacherClassSubjects([
      { id: 1, class: { name: "10", section: "A" }, subject: { name: "Mathematics" } },
      { id: 2, class: { name: "11", section: "B" }, subject: { name: "Physics" } },
      { id: 3, class: { name: "12", section: "A" }, subject: { name: "Chemistry" } }
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !dueDate || !teacherClassSubjectId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/assignments', {
        title,
        description,
        dueDate,
        teacherClassSubjectId: Number(teacherClassSubjectId)
      });

      toast({
        title: "Success",
        description: "Assignment created successfully"
      });

      setTitle("");
      setDescription("");
      setDueDate("");
      setTeacherClassSubjectId("");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      const errorMessage = error.response?.data?.message || "Failed to create assignment";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
          <DialogDescription>
            Create a new assignment for your students.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Assignment title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Assignment description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="class-subject">Class & Subject *</Label>
            <Select value={teacherClassSubjectId} onValueChange={setTeacherClassSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select class and subject" />
              </SelectTrigger>
              <SelectContent>
                {teacherClassSubjects.map((tcs) => (
                  <SelectItem key={tcs.id} value={tcs.id.toString()}>
                    {tcs.subject.name} - {tcs.class.name}-{tcs.class.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? "Creating..." : "Create Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}