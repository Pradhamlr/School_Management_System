import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

type Teacher = any;

const Row: React.FC<{label: string; value?: React.ReactNode}> = ({label, value}) => (
  <div className="flex justify-between py-2 border-b last:border-b-0">
    <div className="text-sm text-muted-foreground">{label}</div>
    <div className="text-sm font-medium">{value ?? '—'}</div>
  </div>
);

export default function TeacherDetailsModal({ open, onOpenChange, teacher }: { open: boolean; onOpenChange: (v:boolean)=>void; teacher: Teacher | null }){
  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Teacher Profile</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 p-4">
          <div className="w-28 flex-shrink-0">
            <Avatar className="w-28 h-28">
              <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white text-2xl">
                {(teacher.user?.name || '').split(' ').map((n:string)=>n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{teacher.user?.name}</h3>
            <p className="text-sm text-muted-foreground">{teacher.user?.email}</p>
            <div className="mt-3 flex gap-2 flex-wrap">
              <Badge>{(!teacher.department || teacher.department === '_') ? '\u2014' : teacher.department}</Badge>
              <Badge>Status: {teacher.status ?? 'Active'}</Badge>
            </div>

            <div className="mt-4 border rounded-md overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 text-sm font-medium">Contact</div>
              <div className="p-4">
                <Row label="Phone" value={teacher.user?.phone || '—'} />
                <Row label="Address" value={teacher.address || '—'} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-md overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 text-sm font-medium">Advising (Class Teacher)</div>
                <div className="p-4">
                  { (teacher.advisedClasses || []).length > 0 ? (
                    <div className="flex flex-col gap-2">
                      { (teacher.advisedClasses || []).map((c:any) => (
                        <div key={c.id} className="flex items-center justify-between">
                          <div className="font-medium">{c.name}{c.section ? ` ${c.section}` : ''}</div>
                          <div className="text-sm text-muted-foreground">Class ID {c.id}</div>
                        </div>
                      )) }
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Not a class teacher for any class.</div>
                  ) }
                </div>
              </div>

              <div className="border rounded-md overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 text-sm font-medium">Subject Assignments</div>
                <div className="p-4">
                  { (teacher.teachingAssignments || []).length > 0 ? (
                    <div className="flex flex-col gap-2">
                      { (teacher.teachingAssignments || []).map((ta:any, i:number) => (
                        <div key={i} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{ta.subject?.name || ta.subject?.code || 'Subject'}</div>
                            <div className="text-sm text-muted-foreground">Class: {ta.class ? `${ta.class.name}${ta.class.section ? ` ${ta.class.section}` : ''}` : '—'}</div>
                          </div>
                          <Badge variant="secondary" className="text-xs">{ta.subject?.type || '—'}</Badge>
                        </div>
                      )) }
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No subject assignments</div>
                  ) }
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Bio</h4>
              <p className="text-sm text-muted-foreground">{teacher.bio || 'No biography provided.'}</p>
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
