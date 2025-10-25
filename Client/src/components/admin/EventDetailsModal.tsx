import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Users, Clock, User, GraduationCap } from 'lucide-react';

interface EventDetailsModalProps {
  event: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EventDetailsModal({ event, open, onOpenChange }: EventDetailsModalProps) {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">{event.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Event Info */}
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium">{new Date(event.startDate).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">{new Date(event.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
                
                {event.location && (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{event.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Organizer */}
          {event.teacher?.user?.name && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                  Event Organizer
                </h3>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                    {event.teacher.user.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{event.teacher.user.name}</p>
                    <p className="text-sm text-muted-foreground">Event Coordinator</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Volunteers */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Volunteers
                <Badge variant="secondary">{(event.volunteers || []).length}</Badge>
              </h3>
              
              {(event.volunteers || []).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No volunteers registered yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(event.volunteers || []).map((volunteer: any) => (
                    <div key={volunteer.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white text-sm font-medium">
                        {(volunteer.student?.user?.name || 'U').split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {volunteer.student?.user?.name || `Student ${volunteer.student?.id || volunteer.id}`}
                        </p>
                        <p className="text-sm text-muted-foreground">Volunteer</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Status */}
          <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                  <span className="font-medium text-emerald-800">
                    {new Date(event.startDate) > new Date() ? 'Upcoming Event' : 'Past Event'}
                  </span>
                </div>
                <div className="text-sm text-emerald-700">
                  Event ID: {event.id}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}