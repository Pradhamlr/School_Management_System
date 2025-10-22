import { useState, useEffect } from "react";
import { Bell, CheckCircle, AlertCircle, Info, Calendar, FileText, Trophy, User } from "lucide-react";
import StudentSidebar from "@/components/StudentSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notificationAPI } from '@/lib/api';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationAPI.getNotifications();
        const apiNotifications = (response.data.data || []).map(notif => ({
          id: notif.id,
          type: 'announcement',
          title: notif.title,
          message: notif.message,
          time: new Date(notif.createdAt).toLocaleDateString(),
          unread: true,
          priority: 'medium'
        }));
        setNotifications(apiNotifications.length > 0 ? apiNotifications : mockNotifications);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setNotifications(mockNotifications);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const mockNotifications = [
    {
      id: 1,
      type: "assignment",
      title: "New Assignment Posted",
      message: "Mathematics - Calculus Problem Set has been assigned. Due date: February 15, 2024",
      time: "2 hours ago",
      unread: true,
      priority: "high"
    },
    {
      id: 2,
      type: "grade",
      title: "Grade Updated",
      message: "Your Physics Lab Report has been graded. Score: 87/100 (B+)",
      time: "4 hours ago",
      unread: true,
      priority: "medium"
    },
    {
      id: 3,
      type: "exam",
      title: "Exam Reminder",
      message: "Chemistry Quiz scheduled for tomorrow at 11:00 AM in Lab 2",
      time: "6 hours ago",
      unread: true,
      priority: "high"
    },
    {
      id: 4,
      type: "event",
      title: "School Event",
      message: "Science Fair registration is now open. Register before February 20, 2024",
      time: "1 day ago",
      unread: false,
      priority: "low"
    },
    {
      id: 5,
      type: "announcement",
      title: "Class Schedule Change",
      message: "English Literature class moved to Room 301 for this week",
      time: "2 days ago",
      unread: false,
      priority: "medium"
    },
    {
      id: 6,
      type: "assignment",
      title: "Assignment Reminder",
      message: "Computer Science Project submission deadline is approaching (Due: Feb 10)",
      time: "3 days ago",
      unread: false,
      priority: "high"
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment': return FileText;
      case 'grade': return Trophy;
      case 'exam': return AlertCircle;
      case 'event': return Calendar;
      case 'announcement': return Info;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'assignment': return 'text-blue-600 bg-blue-50';
      case 'grade': return 'text-green-600 bg-green-50';
      case 'exam': return 'text-red-600 bg-red-50';
      case 'event': return 'text-purple-600 bg-purple-50';
      case 'announcement': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, unread: false } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, unread: false })));
  };

  const unreadCount = notifications.filter(n => n.unread).length;
  const unreadNotifications = notifications.filter(n => n.unread);
  const readNotifications = notifications.filter(n => !n.unread);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <StudentSidebar />
      
      <div className="flex-1">
        <DashboardHeader />
        
        <main className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-1">Stay updated with your academic activities</p>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {unreadCount} unread
              </Badge>
              <Button onClick={markAllAsRead} variant="outline">
                Mark All as Read
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
              <TabsTrigger value="read">Read ({readNotifications.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                
                return (
                  <Card key={notification.id} className={`border-0 shadow-lg bg-white/80 backdrop-blur transition-all cursor-pointer hover:shadow-xl ${
                    notification.unread ? 'border-l-4 border-l-blue-500' : ''
                  }`} onClick={() => markAsRead(notification.id)}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className={`font-semibold text-gray-900 ${notification.unread ? 'font-bold' : ''}`}>
                                {notification.title}
                              </h3>
                              <p className="text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-sm text-gray-500 mt-2">{notification.time}</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge className={`${getPriorityColor(notification.priority)} border text-xs`}>
                                {notification.priority}
                              </Badge>
                              {notification.unread && (
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="unread" className="space-y-4">
              {unreadNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                
                return (
                  <Card key={notification.id} className="border-0 shadow-lg bg-white/80 backdrop-blur transition-all cursor-pointer hover:shadow-xl border-l-4 border-l-blue-500" onClick={() => markAsRead(notification.id)}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-gray-900">{notification.title}</h3>
                              <p className="text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-sm text-gray-500 mt-2">{notification.time}</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge className={`${getPriorityColor(notification.priority)} border text-xs`}>
                                {notification.priority}
                              </Badge>
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {unreadNotifications.length === 0 && (
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-600">You have no unread notifications.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="read" className="space-y-4">
              {readNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                
                return (
                  <Card key={notification.id} className="border-0 shadow-lg bg-white/80 backdrop-blur opacity-75">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                              <p className="text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-sm text-gray-500 mt-2">{notification.time}</p>
                            </div>
                            
                            <Badge className={`${getPriorityColor(notification.priority)} border text-xs`}>
                              {notification.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default StudentNotifications;