import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const Row: React.FC<{label: string; value?: React.ReactNode}> = ({label, value}) => (
  <div className="flex justify-between py-2 border-b last:border-b-0">
    <div className="text-sm text-muted-foreground">{label}</div>
    <div className="text-sm font-medium">{value ?? '—'}</div>
  </div>
);

export default function StudentDetailsModal({ open, onOpenChange, student }: { open: boolean; onOpenChange: (v:boolean)=>void; student: any | null }){
  const [cls, setCls] = React.useState<any | null>(null);

  React.useEffect(() => {
    let mounted = true;
    if (!open || !student) return;
    (async () => {
      try {
        const api = await import('@/lib/api').then(m => m.default);
        const res = await api.get(`/api/classes/${student.classId}`);
        if (!mounted) return;
        setCls(res.data.class || null);
      } catch (e) {
        setCls(null);
      }
    })();
    return () => { mounted = false; };
  }, [open, student]);

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Student Profile</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 p-4">
          <div className="w-28 flex-shrink-0">
            <Avatar className="w-28 h-28">
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl">
                {(student.user?.name || '').split(' ').map((n:string)=>n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{student.user?.name}</h3>
            <p className="text-sm text-muted-foreground">{student.user?.email}</p>
            <div className="mt-3 flex gap-2 flex-wrap">
              <Badge>Roll: {student.rollNumber || '—'}</Badge>
              <Badge>Class: {cls ? `${cls.name}${cls.section ? ` ${cls.section}` : ''}` : (student.classId || '—')}</Badge>
              <Badge>Status: {student.status || 'Student'}</Badge>
            </div>

            <div className="mt-4 border rounded-md overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 text-sm font-medium">Contact</div>
              <div className="p-4">
                <Row label="Phone" value={student.user?.phone || '—'} />
                <Row label="Guardian" value={student.guardianName || '—'} />
                <Row label="Address" value={student.address || '—'} />
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Academic</h4>
              <div className="border rounded-md overflow-hidden">
                <div className="p-4">
                  <Row label="GPA" value={student.gpa ?? '—'} />
                  <Row label="Attendance" value={student.attendanceRate ? `${student.attendanceRate}%` : '—'} />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground">{student.notes || 'No notes available.'}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
