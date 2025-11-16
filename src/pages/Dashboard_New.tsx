// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { 
//   Calendar,
//   Clock,
//   Users,
//   MapPin,
//   LogOut,
//   QrCode,
//   CheckCircle,
//   XCircle,
//   ArrowLeft,
//   Plus,
//   Copy
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from '@/context/AuthContext';
// import { QRCodeSVG } from "qrcode.react";
// import { toast } from "sonner";
// import { AddClassDialog } from '@/components/AddClassDialog';
// import { listCourses } from '@/services/api';

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
//   timetable?: Array<{ day: string; time: string; type: 'theory' | 'lab'; room?: string }>;
//   joinCode?: string;
//   credits?: number;
//   semester?: string;
//   session?: 'Spring' | 'Autumn';
//   branch?: string;
//   year?: string;
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
//   const { user, logout } = useAuth();
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
//   const [addClassDialogOpen, setAddClassDialogOpen] = useState(false);
//   const [courses, setCourses] = useState<ClassSession[]>([]);

//   const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

//   const [studentList, setStudentList] = useState<Student[]>([
//     { id: 1, name: 'Aarav Sharma', roll: 'CSE2021001', status: null },
//     { id: 2, name: 'Ananya Patel', roll: 'CSE2021002', status: null },
//     { id: 3, name: 'Arjun Singh', roll: 'CSE2021003', status: null },
//     { id: 4, name: 'Diya Gupta', roll: 'CSE2021004', status: null },
//     { id: 5, name: 'Ishaan Kumar', roll: 'CSE2021005', status: null },
//   ]);

//   // Load courses from backend
//   useEffect(() => {
//     loadCourses();
//   }, []);

//   const loadCourses = async () => {
//     try {
//       const res = await listCourses();
//       const mapped = (res?.courses || []).map((c: any) => ({
//         id: c.id,
//         courseCode: c.code,
//         courseName: c.name,
//         section: c.section || 'A',
//         totalStudents: c.enrolledCount || 0,
//         time: '',
//         room: '',
//         status: 'upcoming' as const,
//         timetable: Array.isArray(c.timetable) ? c.timetable : [],
//         joinCode: c.joinCode || '',
//         branch: c.department || '',
//         year: c.academicYear || '',
//         credits: c.credits || 3,
//         semester: c.semester || '',
//         session: c.session || 'Spring'
//       }));
//       setCourses(mapped);
//     } catch (e) {
//       console.warn('Failed to load courses from API');
//       setCourses([]);
//     }
//   };

//   // Build timetable dynamically from all courses
//   const buildTimetable = (): Record<string, ClassSession[]> => {
//     const timetable: Record<string, ClassSession[]> = {
//       Monday: [],
//       Tuesday: [],
//       Wednesday: [],
//       Thursday: [],
//       Friday: [],
//       Saturday: []
//     };

//     courses.forEach(course => {
//       if (course.timetable && Array.isArray(course.timetable)) {
//         course.timetable.forEach((slot: any) => {
//           if (timetable[slot.day]) {
//             timetable[slot.day].push({
//               ...course,
//               time: slot.time,
//               room: slot.room || 'TBA'
//             });
//           }
//         });
//       }
//     });

//     return timetable;
//   };

//   const timetableData = buildTimetable();
//   const todaySchedule = timetableData[selectedDay] || [];

//   useEffect(() => {
//     if (qrActive && qrTimer > 0) {
//       const timer = setInterval(() => {
//         setQrTimer(prev => {
//           if (prev <= 1) {
//             setQrActive(false);
//             toast.info('QR Code expired');
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//       return () => clearInterval(timer);
//     }
//   }, [qrActive, qrTimer]);

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

//   const endSession = () => {
//     setQrActive(false);
//     setSessionEnded(true);
//     toast.success('Session ended successfully!');
//   };

//   const filteredStudents = studentList.filter(s => 
//     s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
//     s.roll.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const presentCount = studentList.filter(s => s.status === 'present').length;
//   const absentCount = studentList.filter(s => s.status === 'absent').length;

//   const handleLogout = () => {
//     logout();
//     toast.success('Logged out successfully');
//     navigate('/login');
//   };

//   const handleClassAdded = () => {
//     loadCourses();
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
//               <p className="text-sm opacity-90">{user?.email || 'Dr. Faculty'}</p>
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
//             onClick={() => {
//               setActiveTab('home');
//               setSelectedCourse(null);
//             }}
//             className={`px-6 py-3 font-medium transition-colors ${
//               activeTab === 'home'
//                 ? 'text-primary border-b-2 border-primary'
//                 : 'text-gray-600 hover:text-gray-900'
//             }`}
//           >
//             Home
//           </button>
//           <button
//             onClick={() => {
//               setActiveTab('classes');
//               setSelectedCourse(null);
//             }}
//             className={`px-6 py-3 font-medium transition-colors ${
//               activeTab === 'classes'
//                 ? 'text-primary border-b-2 border-primary'
//                 : 'text-gray-600 hover:text-gray-900'
//             }`}
//           >
//             Classes
//           </button>
//           <button
//             onClick={() => {
//               setActiveTab('timetable');
//               setSelectedCourse(null);
//             }}
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
//                             <span className="text-sm text-muted-foreground">Section {cls.section}</span>
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
//           </div>
//         )}

//         {/* CLASSES TAB */}
//         {activeTab === 'classes' && !selectedCourse && (
//           <div>
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-2xl font-bold">My Classes</h2>
//               <Button onClick={() => setAddClassDialogOpen(true)} className="gap-2">
//                 <Plus size={20} />
//                 Add Class
//               </Button>
//             </div>

//             {courses.length === 0 ? (
//               <Card className="p-12 text-center">
//                 <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
//                 <h3 className="text-xl font-semibold mb-2">No Classes Yet</h3>
//                 <p className="text-muted-foreground mb-6">
//                   Get started by adding your first class
//                 </p>
//                 <Button
//                   onClick={() => setAddClassDialogOpen(true)}
//                   className="gap-2"
//                 >
//                   <Plus size={20} />
//                   Add Your First Class
//                 </Button>
//               </Card>
//             ) : (
//               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {courses.map(course => (
//                   <Card 
//                     key={course.id}
//                     className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
//                     onClick={() => setSelectedCourse(course)}
//                   >
//                     <div className="flex items-start justify-between mb-3">
//                       <Badge variant="secondary" className="text-lg">
//                         {course.courseCode}
//                       </Badge>
//                       <span className="text-sm text-muted-foreground">Section {course.section}</span>
//                     </div>
//                     <h3 className="font-bold text-lg mb-2">{course.courseName}</h3>
//                     <div className="space-y-1 text-sm text-muted-foreground mb-3">
//                       <p>{course.branch} {course.year}</p>
//                       <p>{course.credits} Credits • {course.session}</p>
//                     </div>
//                     <p className="text-muted-foreground flex items-center gap-2">
//                       <Users className="w-4 h-4" />
//                       {course.totalStudents} Students
//                     </p>
//                   </Card>
//                 ))}
//               </div>
//             )}
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
//                         <div key={cls.id + cls.time} className="flex items-center gap-4 p-2 bg-muted rounded">
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
//               <div className="flex items-center justify-between">
//                 <div>
//                   <div className="flex items-center gap-3 mb-2">
//                     <Badge variant="secondary" className="text-lg px-3 py-1">
//                       {selectedCourse.courseCode}
//                     </Badge>
//                     <span className="text-muted-foreground">Section {selectedCourse.section}</span>
//                   </div>
//                   <h2 className="text-3xl font-bold">{selectedCourse.courseName}</h2>
//                   <p className="text-muted-foreground mt-2 flex items-center gap-2">
//                     <Users size={18} />
//                     {selectedCourse.totalStudents} Students
//                   </p>
//                 </div>
//                 {selectedCourse.joinCode && (
//                   <div className="text-right bg-primary/10 p-4 rounded-lg border-2 border-primary/30">
//                     <p className="text-xs text-muted-foreground mb-1">Join Code:</p>
//                     <p className="text-3xl font-mono font-bold text-primary tracking-wider">{selectedCourse.joinCode}</p>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className="mt-2 text-xs gap-1"
//                       onClick={() => {
//                         navigator.clipboard.writeText(selectedCourse.joinCode || '');
//                         toast.success('Join code copied to clipboard!');
//                       }}
//                     >
//                       <Copy size={14} />
//                       Copy Code
//                     </Button>
//                   </div>
//                 )}
//               </div>
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
//                       </div>
                      
//                       <div className="flex gap-3">
//                         <Button 
//                           onClick={regenerateQR}
//                           variant="outline"
//                           className="flex-1"
//                         >
//                           Regenerate QR
//                         </Button>
//                         <Button 
//                           onClick={endSession}
//                           variant="destructive"
//                           className="flex-1"
//                         >
//                           End Session
//                         </Button>
//                       </div>
//                     </div>
//                   )}

//                   {sessionEnded && (
//                     <div className="text-center py-8">
//                       <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
//                       <h4 className="text-xl font-bold mb-2">Session Ended</h4>
//                       <p className="text-muted-foreground mb-4">
//                         {presentCount} students marked present
//                       </p>
//                       <Button onClick={() => {
//                         setSessionEnded(false);
//                         setAttendanceList([]);
//                         setStudentList(studentList.map(s => ({ ...s, status: null })));
//                       }}>
//                         Start New Session
//                       </Button>
//                     </div>
//                   )}
//                 </Card>
//               </div>

//               {/* Attendance List */}
//               <div className="lg:col-span-1">
//                 <Card className="p-6">
//                   <h3 className="text-lg font-bold mb-4">Live Attendance</h3>
                  
//                   <div className="grid grid-cols-2 gap-3 mb-4">
//                     <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
//                       <p className="text-2xl font-bold text-green-600">{presentCount}</p>
//                       <p className="text-xs text-green-600">Present</p>
//                     </div>
//                     <div className="bg-red-50 border border-red-200 rounded p-3 text-center">
//                       <p className="text-2xl font-bold text-red-600">{absentCount}</p>
//                       <p className="text-xs text-red-600">Absent</p>
//                     </div>
//                   </div>

//                   <div className="relative mb-4">
//                     <Input 
//                       placeholder="Search students..."
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                       className="pr-10"
//                     />
//                   </div>

//                   <div className="space-y-2 max-h-96 overflow-y-auto">
//                     {filteredStudents.map(student => (
//                       <div key={student.id} className="flex items-center justify-between p-2 bg-muted rounded">
//                         <div className="flex-1">
//                           <p className="text-sm font-medium">{student.name}</p>
//                           <p className="text-xs text-muted-foreground">{student.roll}</p>
//                         </div>
//                         <div className="flex gap-1">
//                           <Button
//                             size="sm"
//                             variant={student.status === 'present' ? 'default' : 'outline'}
//                             onClick={() => handleStudentSearch(student.id, 'present')}
//                             className="h-7 px-2"
//                           >
//                             <CheckCircle size={14} />
//                           </Button>
//                           <Button
//                             size="sm"
//                             variant={student.status === 'absent' ? 'destructive' : 'outline'}
//                             onClick={() => handleStudentSearch(student.id, 'absent')}
//                             className="h-7 px-2"
//                           >
//                             <XCircle size={14} />
//                           </Button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </Card>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       <AddClassDialog 
//         open={addClassDialogOpen}
//         onOpenChange={setAddClassDialogOpen}
//         onClassAdded={handleClassAdded}
//       />
//     </div>
//   );
// };

// export default Dashboard;
