// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { 
//   Calendar,
//   Clock,
//   Users,
//   MapPin,
//   Search,
//   LogOut,
//   QrCode,
//   CheckCircle,
//   XCircle,
//   BarChart3,
//   ArrowLeft
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { QRCodeSVG } from "qrcode.react";
// import { toast } from "sonner";

// interface ClassSession {
//   id: string;
//   courseCode: string;
//   courseName: string;
//   section: string;
//   time: string;
//   room: string;
//   totalStudents: number;
//   status: "upcoming" | "ongoing" | "completed";
//   attendancePercentage?: number;
// }

// interface Student {
//   id: number;
//   name: string;
//   roll: string;
//   status: 'present' | 'absent' | null;
// }

// interface AttendedStudent extends Student {
//   time: string;
// }

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("home");
//   const [selectedDay, setSelectedDay] = useState('Monday');
//   const [selectedCourse, setSelectedCourse] = useState<ClassSession | null>(null);
//   const [qrActive, setQrActive] = useState(false);
//   const [qrTimer, setQrTimer] = useState(300);
//   const [qrDuration, setQrDuration] = useState(5);
//   const [locationRadius, setLocationRadius] = useState(25);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [attendanceList, setAttendanceList] = useState<AttendedStudent[]>([]);
//   const [sessionEnded, setSessionEnded] = useState(false);

//   const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

//   // Sample data
//   const courses: ClassSession[] = [
//     { 
//       id: '1', 
//       courseCode: 'CS301', 
//       courseName: 'Data Structures', 
//       section: 'A',
//       time: '9:00 AM - 10:00 AM', 
//       room: 'Room 301',
//       totalStudents: 45,
//       status: 'upcoming',
//       attendancePercentage: 87
//     },
//     { 
//       id: '2', 
//       courseCode: 'CS302', 
//       courseName: 'Database Systems', 
//       section: 'B',
//       time: '10:00 AM - 11:00 AM', 
//       room: 'Lab A',
//       totalStudents: 40,
//       status: 'ongoing',
//       attendancePercentage: 92
//     },
//     { 
//       id: '3', 
//       courseCode: 'CS303', 
//       courseName: 'Operating Systems', 
//       section: 'A',
//       time: '11:30 AM - 12:30 PM', 
//       room: 'Room 205',
//       totalStudents: 48,
//       status: 'upcoming',
//       attendancePercentage: 85
//     }
//   ];

//   const [studentList, setStudentList] = useState<Student[]>([
//     { id: 1, name: 'Rahul Sharma', roll: '21CS001', status: null },
//     { id: 2, name: 'Priya Singh', roll: '21CS002', status: null },
//     { id: 3, name: 'Amit Kumar', roll: '21CS003', status: null },
//     { id: 4, name: 'Sneha Reddy', roll: '21CS004', status: null },
//     { id: 5, name: 'Vikram Patel', roll: '21CS005', status: null },
//   ]);

//   const recentSessions = [
//     { 
//       id: '1', 
//       courseCode: 'CS301', 
//       courseName: 'Data Structures',
//       date: 'Nov 4, 2024',
//       time: '9:00 AM',
//       present: 42,
//       total: 45,
//       percentage: 93
//     },
//     { 
//       id: '2', 
//       courseCode: 'CS302', 
//       courseName: 'Database Systems',
//       date: 'Nov 3, 2024',
//       time: '10:00 AM',
//       present: 38,
//       total: 40,
//       percentage: 95
//     }
//   ];

//   const todaySchedule = courses.filter(c => {
//     // For demo, show all courses on Monday
//     return selectedDay === 'Monday';
//   });

//   const timetableData: Record<string, ClassSession[]> = {
//     'Monday': courses,
//     'Tuesday': [courses[0]],
//     'Wednesday': [courses[1], courses[2]],
//     'Thursday': [courses[0], courses[2]],
//     'Friday': [courses[1]],
//     'Saturday': []
//   };

//   const generateQR = () => {
//     setQrActive(true);
//     setQrTimer(qrDuration * 60);
//     setSessionEnded(false);
//     toast.success('QR Code generated successfully!');
//   };

//   const regenerateQR = () => {
//     setQrTimer(qrDuration * 60);
//     toast.success('QR Code regenerated!');
//   };

//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   const endSession = () => {
//     setQrActive(false);
//     setSessionEnded(true);
//     toast.success('Session ended successfully!');
//   };

//   const handleStudentSearch = (studentId: number, newStatus: 'present' | 'absent') => {
//     const student = studentList.find(s => s.id === studentId);
//     if (!student) return;

//     setStudentList(studentList.map(s => 
//       s.id === studentId ? { ...s, status: newStatus } : s
//     ));

//     if (newStatus === 'present') {
//       const now = new Date();
//       setAttendanceList([...attendanceList, { 
//         ...student, 
//         status: 'present',
//         time: now.toLocaleTimeString() 
//       }]);
//       toast.success(`${student.name} marked present`);
//     } else {
//       setAttendanceList(attendanceList.filter(s => s.id !== studentId));
//       toast.info(`${student.name} marked absent`);
//     }
//   };

//   // QR Timer countdown
//   useState(() => {
//     if (qrActive && qrTimer > 0) {
//       const interval = setInterval(() => {
//         setQrTimer(prev => {
//           if (prev <= 1) {
//             setQrActive(false);
//             toast.info('QR Code expired');
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//       return () => clearInterval(interval);
//     }
//   });

//   const handleLogout = () => {
//     toast.success('Logged out successfully');
//     navigate('/login');
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md">
//         <div className="max-w-7xl mx-auto flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <Users className="w-8 h-8" />
//             <div>
//               <h1 className="text-2xl font-bold">Faculty Portal</h1>
//               <p className="text-sm opacity-90">Dr. Amit Kumar</p>
//             </div>
//           </div>
//           <Button 
//             variant="secondary"
//             onClick={handleLogout}
//             className="flex items-center gap-2"
//           >
//             <LogOut className="w-4 h-4" />
//             Logout
//           </Button>
//         </div>
//       </div>

//       {/* Navigation Tabs */}
//       <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
//         <div className="max-w-7xl mx-auto flex gap-1 px-4">
//           <button
//             onClick={() => setActiveTab('home')}
//             className={`px-6 py-3 font-medium transition-colors ${
//               activeTab === 'home'
//                 ? 'text-primary border-b-2 border-primary'
//                 : 'text-gray-600 hover:text-gray-900'
//             }`}
//           >
//             Home
//           </button>
//           <button
//             onClick={() => setActiveTab('classes')}
//             className={`px-6 py-3 font-medium transition-colors ${
//               activeTab === 'classes'
//                 ? 'text-primary border-b-2 border-primary'
//                 : 'text-gray-600 hover:text-gray-900'
//             }`}
//           >
//             Classes
//           </button>
//           <button
//             onClick={() => setActiveTab('timetable')}
//             className={`px-6 py-3 font-medium transition-colors ${
//               activeTab === 'timetable'
//                 ? 'text-primary border-b-2 border-primary'
//                 : 'text-gray-600 hover:text-gray-900'
//             }`}
//           >
//             Timetable
//           </button>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto p-6">
//         {/* HOME TAB */}
//         {activeTab === 'home' && !selectedCourse && (
//           <div className="space-y-6">
//             {/* Today's Schedule */}
//             <Card className="p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-xl font-bold flex items-center gap-2">
//                   <Calendar className="w-5 h-5 text-primary" />
//                   Today's Schedule
//                 </h2>
//                 <div className="flex gap-2">
//                   {days.map(day => (
//                     <Button
//                       key={day}
//                       variant={selectedDay === day ? 'default' : 'outline'}
//                       size="sm"
//                       onClick={() => setSelectedDay(day)}
//                     >
//                       {day.slice(0, 3)}
//                     </Button>
//                   ))}
//                 </div>
//               </div>

//               {todaySchedule.length === 0 ? (
//                 <div className="text-center py-8 text-muted-foreground">
//                   <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
//                   <p>No classes scheduled for {selectedDay}</p>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {todaySchedule.map(cls => (
//                     <div key={cls.id} className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
//                       <div className="flex items-start justify-between">
//                         <div className="flex-1">
//                           <div className="flex items-center gap-2 mb-1">
//                             <Clock className="w-4 h-4 text-muted-foreground" />
//                             <span className="text-sm text-muted-foreground">{cls.time}</span>
//                           </div>
//                           <div className="flex items-center gap-2 mb-1">
//                             <Badge variant="secondary">{cls.courseCode}</Badge>
//                             <span className="font-medium">{cls.courseName}</span>
//                           </div>
//                           <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                             <MapPin className="w-4 h-4" />
//                             <span>{cls.room}</span>
//                           </div>
//                         </div>
//                         <Button onClick={() => setSelectedCourse(cls)}>
//                           Start Session
//                         </Button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </Card>

//             {/* Recent Sessions */}
//             <Card className="p-6">
//               <h2 className="text-xl font-bold mb-4">Recent Sessions</h2>
//               <div className="space-y-3">
//                 {recentSessions.map(session => (
//                   <div key={session.id} className="p-4 bg-muted rounded-lg">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <div className="flex items-center gap-2 mb-1">
//                           <Badge variant="secondary">{session.courseCode}</Badge>
//                           <span className="font-medium">{session.courseName}</span>
//                         </div>
//                         <p className="text-sm text-muted-foreground">
//                           {session.date} • {session.time}
//                         </p>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-2xl font-bold text-primary">{session.percentage}%</p>
//                         <p className="text-sm text-muted-foreground">
//                           {session.present}/{session.total} present
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </Card>
//           </div>
//         )}

//         {/* CLASSES TAB */}
//         {activeTab === 'classes' && !selectedCourse && (
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {courses.map(course => (
//               <Card 
//                 key={course.id}
//                 className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
//                 onClick={() => setSelectedCourse(course)}
//               >
//                 <div className="flex items-start justify-between mb-3">
//                   <Badge variant="secondary" className="text-lg">
//                     {course.courseCode}
//                   </Badge>
//                   <span className="text-sm text-muted-foreground">Section {course.section}</span>
//                 </div>
//                 <h3 className="font-bold text-lg mb-2">{course.courseName}</h3>
//                 <p className="text-muted-foreground flex items-center gap-2">
//                   <Users className="w-4 h-4" />
//                   {course.totalStudents} Students
//                 </p>
//               </Card>
//             ))}
//           </div>
//         )}

//         {/* TIMETABLE TAB */}
//         {activeTab === 'timetable' && (
//           <Card className="p-6">
//             <h2 className="text-xl font-bold mb-4">Weekly Timetable</h2>
//             <div className="space-y-4">
//               {days.map(day => (
//                 <div key={day} className="border rounded-lg p-4">
//                   <h3 className="font-semibold mb-3">{day}</h3>
//                   {timetableData[day]?.length > 0 ? (
//                     <div className="space-y-2">
//                       {timetableData[day].map(cls => (
//                         <div key={cls.id} className="flex items-center gap-4 p-2 bg-muted rounded">
//                           <Clock className="w-4 h-4 text-muted-foreground" />
//                           <span className="text-sm font-medium">{cls.time}</span>
//                           <Badge variant="secondary">{cls.courseCode}</Badge>
//                           <span className="flex-1">{cls.courseName}</span>
//                           <span className="text-sm text-muted-foreground">{cls.room}</span>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <p className="text-sm text-muted-foreground">No classes</p>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </Card>
//         )}

//         {/* COURSE DETAIL VIEW */}
//         {selectedCourse && (
//           <div className="space-y-6">
//             <Button 
//               variant="ghost"
//               className="flex items-center gap-2 w-fit"
//               onClick={() => setSelectedCourse(null)}
//             >
//               <ArrowLeft size={20} />
//               Back to {activeTab === 'home' ? 'Home' : 'Classes'}
//             </Button>

//             <Card className="p-6">
//               <div className="flex items-center gap-3 mb-2">
//                 <Badge variant="secondary" className="text-lg px-3 py-1">
//                   {selectedCourse.courseCode}
//                 </Badge>
//                 <span className="text-muted-foreground">Section {selectedCourse.section}</span>
//               </div>
//               <h2 className="text-3xl font-bold">{selectedCourse.courseName}</h2>
//               <p className="text-muted-foreground mt-2 flex items-center gap-2">
//                 <Users size={18} />
//                 {selectedCourse.totalStudents} Students
//               </p>
//             </Card>

//             <div className="grid lg:grid-cols-3 gap-6">
//               {/* QR Code Section */}
//               <div className="lg:col-span-2">
//                 <Card className="p-6">
//                   <h3 className="text-xl font-bold mb-6">QR Code Attendance</h3>
                  
//                   {!qrActive && !sessionEnded && (
//                     <div className="space-y-6">
//                       <div className="grid md:grid-cols-2 gap-4">
//                         <div>
//                           <label className="block text-sm font-medium mb-2">
//                             QR Validity (minutes)
//                           </label>
//                           <Input 
//                             type="number"
//                             value={qrDuration}
//                             onChange={(e) => setQrDuration(Math.max(1, parseInt((e.target as HTMLInputElement).value) || 1))}
//                             min="1"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium mb-2">
//                             Location Radius (meters)
//                           </label>
//                           <Input 
//                             type="number"
//                             value={locationRadius}
//                             onChange={(e) => setLocationRadius(Math.min(500, Math.max(5, parseInt((e.target as HTMLInputElement).value) || 25)))}
//                             min="5"
//                             max="500"
//                           />
//                         </div>
//                       </div>
                      
//                       <Button 
//                         onClick={generateQR}
//                         className="w-full flex items-center justify-center gap-2"
//                         size="lg"
//                       >
//                         <QrCode size={24} />
//                         Generate QR Code
//                       </Button>
//                     </div>
//                   )}

//                   {qrActive && (
//                     <div className="space-y-6">
//                       <div className="bg-muted/50 rounded-lg p-8 text-center">
//                         <div className="bg-white w-64 h-64 mx-auto rounded-lg shadow-lg flex items-center justify-center mb-4">
//                           <QRCodeSVG
//                             value={`session-${selectedCourse.id}-${Date.now()}`}
//                             size={240}
//                             level="H"
//                           />
//                         </div>
//                         <div className="text-3xl font-bold text-primary mb-2">
//                           {formatTime(qrTimer)}
//                         </div>
//                         <div className="w-full bg-muted rounded-full h-2 mb-4">
//                           <div 
//                             className="bg-primary h-2 rounded-full transition-all"
//                             style={{ width: `${(qrTimer / (qrDuration * 60)) * 100}%` }}
//                           />
//                         </div>
//                         <p className="text-muted-foreground">Time remaining</p>
//                         <p className="text-sm text-muted-foreground mt-2">Range: {locationRadius}m</p>
//                       </div>
                      
//                       <div className="grid grid-cols-2 gap-4">
//                         <Button 
//                           onClick={regenerateQR}
//                           variant="secondary"
//                         >
//                           Regenerate QR
//                         </Button>
//                         <Button 
//                           onClick={endSession}
//                           variant="destructive"
//                         >
//                           End Session
//                         </Button>
//                       </div>
//                     </div>
//                   )}

//                   {sessionEnded && (
//                     <div className="space-y-6">
//                       <div className="text-center py-6 bg-muted/50 rounded-lg">
//                         <BarChart3 className="w-16 h-16 mx-auto mb-4 text-primary" />
//                         <h4 className="text-lg font-semibold mb-4">Session Statistics</h4>
                        
//                         <div className="grid grid-cols-3 gap-4 mb-6">
//                           <div>
//                             <p className="text-3xl font-bold">{selectedCourse.totalStudents}</p>
//                             <p className="text-sm text-muted-foreground">Total Students</p>
//                           </div>
//                           <div>
//                             <p className="text-3xl font-bold text-green-600">{attendanceList.length}</p>
//                             <p className="text-sm text-muted-foreground">Present</p>
//                           </div>
//                           <div>
//                             <p className="text-3xl font-bold text-red-600">
//                               {selectedCourse.totalStudents - attendanceList.length}
//                             </p>
//                             <p className="text-sm text-muted-foreground">Absent</p>
//                           </div>
//                         </div>

//                         <div className="w-full bg-muted rounded-full h-4 mb-2">
//                           <div 
//                             className="bg-green-600 h-4 rounded-full"
//                             style={{ 
//                               width: `${(attendanceList.length / selectedCourse.totalStudents) * 100}%` 
//                             }}
//                           />
//                         </div>
//                         <p className="text-sm text-muted-foreground">
//                           {Math.round((attendanceList.length / selectedCourse.totalStudents) * 100)}% Attendance
//                         </p>
//                       </div>

//                       <Button 
//                         onClick={() => {
//                           setSessionEnded(false);
//                           setAttendanceList([]);
//                           setStudentList(studentList.map(s => ({ ...s, status: null })));
//                         }}
//                         className="w-full"
//                       >
//                         Start New Session
//                       </Button>
//                     </div>
//                   )}

//                   {/* Manual Attendance Section */}
//                   <div className="mt-8 pt-6 border-t">
//                     <h4 className="font-semibold mb-4">Manual Attendance</h4>
//                     <div className="relative mb-4">
//                       <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//                       <Input
//                         placeholder="Search student by name or roll number..."
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                         className="pl-10"
//                       />
//                     </div>
                    
//                     <div className="space-y-2 max-h-96 overflow-y-auto">
//                       {studentList
//                         .filter(s => 
//                           s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                           s.roll.toLowerCase().includes(searchQuery.toLowerCase())
//                         )
//                         .map(student => (
//                           <div 
//                             key={student.id}
//                             className={`p-3 rounded-lg border flex items-center justify-between ${
//                               student.status === 'present' 
//                                 ? 'bg-green-50 border-green-200' 
//                                 : student.status === 'absent'
//                                 ? 'bg-red-50 border-red-200'
//                                 : 'bg-white'
//                             }`}
//                           >
//                             <div>
//                               <p className="font-medium">{student.name}</p>
//                               <p className="text-sm text-muted-foreground">{student.roll}</p>
//                             </div>
//                             <div className="flex gap-2">
//                               <Button
//                                 size="sm"
//                                 variant={student.status === 'present' ? 'default' : 'outline'}
//                                 onClick={() => handleStudentSearch(student.id, 'present')}
//                               >
//                                 <CheckCircle className="w-4 h-4" />
//                               </Button>
//                               <Button
//                                 size="sm"
//                                 variant={student.status === 'absent' ? 'destructive' : 'outline'}
//                                 onClick={() => handleStudentSearch(student.id, 'absent')}
//                               >
//                                 <XCircle className="w-4 h-4" />
//                               </Button>
//                             </div>
//                           </div>
//                         ))}
//                     </div>
//                   </div>
//                 </Card>
//               </div>

//               {/* Live Attendance Panel */}
//               <div className="lg:col-span-1">
//                 <Card className="p-6 sticky top-32">
//                   <h3 className="text-lg font-bold mb-4">Live Attendance</h3>
//                   {attendanceList.length === 0 ? (
//                     <div className="text-center py-8 text-muted-foreground">
//                       <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
//                       <p className="text-sm">No students marked present yet</p>
//                     </div>
//                   ) : (
//                     <div className="space-y-2 max-h-96 overflow-y-auto">
//                       {attendanceList.map(student => (
//                         <div 
//                           key={student.id}
//                           className="p-3 bg-green-50 border border-green-200 rounded-lg"
//                         >
//                           <div className="flex items-start gap-2">
//                             <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
//                             <div className="flex-1">
//                               <p className="font-medium text-sm">{student.name}</p>
//                               <p className="text-xs text-muted-foreground">{student.roll}</p>
//                               <p className="text-xs text-muted-foreground mt-1">{student.time}</p>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </Card>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
