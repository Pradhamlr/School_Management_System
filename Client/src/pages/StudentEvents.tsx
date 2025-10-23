import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, User, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getEvents } from '@/lib/api';

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  teacher?: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  volunteers: Array<{
    student: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
  }>;
}

const StudentEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [volunteerDialogOpen, setVolunteerDialogOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await getEvents();
      console.log('Events API response:', response);
      const eventsData = response.data?.data || response.data || [];
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (startDate: string) => {
    return new Date(startDate) > new Date();
  };

  const upcomingEvents = events.filter(event => isUpcoming(event.startDate));
  const pastEvents = events.filter(event => !isUpcoming(event.startDate));

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600 mt-1">School events and activities</p>
        </div>
        <Dialog open={volunteerDialogOpen} onOpenChange={setVolunteerDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Volunteer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Volunteer for Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Select Event to Volunteer
                </label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {upcomingEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id.toString()}>
                        {event.title} - {formatDate(event.startDate)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setVolunteerDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    // Handle volunteer signup
                    console.log('Volunteering for event:', selectedEvent);
                    setVolunteerDialogOpen(false);
                    setSelectedEvent('');
                  }}
                  disabled={!selectedEvent}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Sign Up as Volunteer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">
            Upcoming Events ({upcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past Events ({pastEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Events</h3>
                <p className="text-gray-600">Check back later for new events and activities.</p>
              </CardContent>
            </Card>
          ) : (
            upcomingEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl text-gray-900">{event.title}</CardTitle>
                      <p className="text-gray-600 mt-1">{event.description}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Upcoming
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">
                        {formatDate(event.startDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-700">
                        {formatTime(event.startDate)} - {formatTime(event.endDate)}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-gray-700">{event.location}</span>
                      </div>
                    )}
                  </div>

                  {event.teacher && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        Organized by: {event.teacher.user.firstName} {event.teacher.user.lastName}
                      </span>
                    </div>
                  )}

                  {event.volunteers.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Volunteers:</p>
                      <div className="flex flex-wrap gap-2">
                        {event.volunteers.map((volunteer, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {volunteer.student.user.firstName} {volunteer.student.user.lastName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Past Events</h3>
                <p className="text-gray-600">Past events will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            pastEvents.map((event) => (
              <Card key={event.id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl text-gray-900">{event.title}</CardTitle>
                      <p className="text-gray-600 mt-1">{event.description}</p>
                    </div>
                    <Badge variant="outline" className="text-gray-600">
                      Completed
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">
                        {formatDate(event.startDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-700">
                        {formatTime(event.startDate)} - {formatTime(event.endDate)}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-gray-700">{event.location}</span>
                      </div>
                    )}
                  </div>

                  {event.teacher && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        Organized by: {event.teacher.user.firstName} {event.teacher.user.lastName}
                      </span>
                    </div>
                  )}

                  {event.volunteers.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Volunteers:</p>
                      <div className="flex flex-wrap gap-2">
                        {event.volunteers.map((volunteer, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {volunteer.student.user.firstName} {volunteer.student.user.lastName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentEvents;