import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Calendar,
  Clock,
  Users,
  MapPin,
  Search,
  LogOut,
  QrCode,
  CheckCircle,
  XCircle,
  BarChart3,
  ArrowLeft,
  Plus,
  MoreVertical,
  Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/context/AuthContext';
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { AddClassDialog } from '@/components/AddClassDialog';
import { listCourses, deleteCourse } from '@/services/api';

interface ClassSession {
  id: string;
  courseCode: string;
  courseName: string;
  section: string;
  time: string;
  room: string;
  totalStudents: number;
  status: "upcoming" | "ongoing" | "completed";
  attendancePercentage?: number;
  timetable?: Array<{ day: string; time: string; type: 'theory' | 'lab'; room?: string }>;
  students?: Array<{ id: number; name: string; rollNumber: string; email: string }>;
  className?: string;
  branch?: string;
  year?: string;
  joinCode?: string;
  credits?: number;
  semester?: string;
  session?: 'Spring' | 'Autumn';
}

interface Student {
  id: number;
  name: string;
  roll: string;
  status: 'present' | 'absent' | null;
}

interface AttendedStudent extends Student {
  time: string;
}

interface ContactPerson {
  id: string;
  name: string;
  mobile: string;
  whatsapp: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const classSelectorRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedCourse, setSelectedCourse] = useState<ClassSession | null>(null);
  const [qrActive, setQrActive] = useState(false);
  const [qrTimer, setQrTimer] = useState(300);
  const [qrDuration, setQrDuration] = useState(5);
  const [locationRadius, setLocationRadius] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceList, setAttendanceList] = useState<AttendedStudent[]>([]);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [now, setNow] = useState<Date>(new Date());

  // Home quick session controls
  const [classQuery, setClassQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [showClassSuggestions, setShowClassSuggestions] = useState(false);
  const [selectedQuickCourse, setSelectedQuickCourse] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [homeQRValue, setHomeQRValue] = useState<string>("");
  const [courseQRValue, setCourseQRValue] = useState<string>("");
  const [addClassDialogOpen, setAddClassDialogOpen] = useState(false);
  const [courses, setCourses] = useState<ClassSession[]>([]);
  const [contactPersons, setContactPersons] = useState<ContactPerson[]>([]);
  const [newContactName, setNewContactName] = useState<string>("");
  const [newContactMobile, setNewContactMobile] = useState<string>("");
  const [newContactWhatsapp, setNewContactWhatsapp] = useState<string>("");

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Load courses from backend
  useEffect(() => {
    (async () => {
      try {
        const res = await listCourses();
        const mapped = (res?.courses || []).map((c: any) => ({
          id: c.id,
          courseCode: c.code,
          courseName: c.name,
          section: c.section || 'A',
          totalStudents: c.enrolledCount || 0,
          time: '',
          room: '',
          status: 'upcoming' as const,
          timetable: Array.isArray(c.timetable) ? c.timetable : [],
          joinCode: c.joinCode || '',
          branch: c.department || '',
          year: c.academicYear || '',
          className: c.className || '',
          credits: c.credits || 3,
          semester: c.semester || '',
          session: c.session || 'Spring'
        }));
        setCourses(mapped);
      } catch (e) {
        console.warn('Failed to load courses from API');
        setCourses([]); // Show empty state instead of cached data
      }
    })();
  }, []);

  // Tick current time every 30 seconds for UI time display
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  // Close class suggestions on outside click
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (classSelectorRef.current && !classSelectorRef.current.contains(e.target as Node)) {
        setShowClassSuggestions(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  // Build timetable dynamically from all courses
  const buildTimetable = () => {
    const timetable: Record<string, Array<{ time: string; course: string; name: string; room?: string; type?: string }>> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: []
    };

    courses.forEach(course => {
      if (course.timetable && Array.isArray(course.timetable)) {
        course.timetable.forEach((slot: any) => {
          if (timetable[slot.day]) {
            timetable[slot.day].push({
              time: slot.time,
              course: course.courseCode,
              name: course.courseName,
              room: slot.room || 'TBA',
              type: slot.type
            });
          }
        });
      }
    });

    return timetable;
  };

  const facultyData = {
    name: user?.email || 'Dr. Faculty',
    courses: courses,
    timetable: buildTimetable(),
    recentSessions: [] // Empty - will be populated from real data later
  };

  const students: Student[] = [
    { id: 1, name: 'Aarav Sharma', roll: 'CSE2021001', status: null },
    { id: 2, name: 'Ananya Patel', roll: 'CSE2021002', status: null },
    { id: 3, name: 'Arjun Singh', roll: 'CSE2021003', status: null },
    { id: 4, name: 'Diya Gupta', roll: 'CSE2021004', status: null },
    { id: 5, name: 'Ishaan Kumar', roll: 'CSE2021005', status: null },
    { id: 6, name: 'Kavya Reddy', roll: 'CSE2021006', status: null },
    { id: 7, name: 'Rohan Verma', roll: 'CSE2021007', status: null },
    { id: 8, name: 'Sanya Desai', roll: 'CSE2021008', status: null },
  ];

  const [studentList, setStudentList] = useState<Student[]>(students);

  useEffect(() => {
    if (qrActive && qrTimer > 0) {
      const timer = setInterval(() => {
        setQrTimer(prev => {
          if (prev <= 1) {
            setQrActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [qrActive, qrTimer]);

  const generateQR = () => {
    setQrActive(true);
    setQrTimer(qrDuration * 60);
    setSessionEnded(false);
    // Generate static QR value once
    const qrData = JSON.stringify({
      type: 'course-attendance',
      courseId: selectedCourse?.id,
      timestamp: Date.now(),
      expiresIn: qrDuration * 60
    });
    setCourseQRValue(qrData);
    toast.success('QR Code generated successfully');
  };

  const regenerateQR = () => {
    setQrTimer(qrDuration * 60);
    // Generate new static QR value
    const qrData = JSON.stringify({
      type: 'course-attendance',
      courseId: selectedCourse?.id,
      timestamp: Date.now(),
      expiresIn: qrDuration * 60
    });
    setCourseQRValue(qrData);
    toast.success('QR Code regenerated');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStudentSearch = (student: Student, status: 'present' | 'absent') => {
    const updated = studentList.map(s => 
      s.id === student.id ? { ...s, status } : s
    );
    setStudentList(updated);
    
    if (status === 'present' && !attendanceList.find(a => a.id === student.id)) {
      setAttendanceList([...attendanceList, { ...student, time: new Date().toLocaleTimeString() }]);
      toast.success(`${student.name} marked present`);
    } else if (status === 'absent') {
      setAttendanceList(attendanceList.filter(a => a.id !== student.id));
      toast.success(`${student.name} marked absent`);
    }
  };

  const endSession = () => {
    setQrActive(false);
    setSessionEnded(true);
    toast.success('Session ended successfully');
  };

  const filteredStudents = studentList.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.roll.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const presentCount = studentList.filter(s => s.status === 'present').length;
  const absentCount = studentList.filter(s => s.status === 'absent').length;

  const handleStartSession = (courseCode: string) => {
    // find course by code and open selectedCourse view under classes tab
    const course = facultyData.courses.find(c => c.courseCode === courseCode);
    if (course) {
      setSelectedCourse(course as any); // cast since timetable slots differ
      setActiveTab('classes');
      // reset prior session state
      setQrActive(false);
      setSessionEnded(false);
      setAttendanceList([]);
      // Use course-specific students if available, else default
      const courseStudents = course.students?.map(s => ({
        id: s.id,
        name: s.name,
        roll: s.rollNumber,
        status: null as 'present' | 'absent' | null
      })) || students;
      setStudentList(courseStudents);
    } else {
      toast.error('Course not found for this slot');
    }
  };

  // Class autocomplete options - only show classes where faculty has created courses
  const uniqueClasses = Array.from(
    new Set(facultyData.courses.map(c => `${c.branch}${c.year}`))
  ).sort();
  const filteredClassOptions = uniqueClasses.filter(opt => opt.toLowerCase().includes(classQuery.toLowerCase()));

  const handleClassAdded = async (_classData: any) => {
    // Refresh from API to ensure consistent view
    try {
      const res = await listCourses();
      const mapped = (res?.courses || []).map((c: any) => ({
        id: c.id,
        courseCode: c.code,
        courseName: c.name,
        section: c.section || 'A',
        totalStudents: c.enrolledCount || 0,
        time: '',
        room: '',
        status: 'upcoming' as const,
        timetable: Array.isArray(c.timetable) ? c.timetable : [],
        joinCode: c.joinCode || ''
      }));
      setCourses(mapped);
    } catch (e) {
      // no-op
    }
  };

  const handleDeleteClass = async (courseId: string, courseName: string) => {
    if (!confirm(`Are you sure you want to delete "${courseName}"? This will also remove all student enrollments.`)) {
      return;
    }

    try {
      await deleteCourse(courseId);
      toast.success('Class deleted successfully');
      
      // Refresh courses list
      const res = await listCourses();
      const mapped = (res?.courses || []).map((c: any) => ({
        id: c.id,
        courseCode: c.code,
        courseName: c.name,
        section: c.section || 'A',
        totalStudents: c.enrolledCount || 0,
        time: '',
        room: '',
        status: 'upcoming' as const,
        timetable: Array.isArray(c.timetable) ? c.timetable : [],
        joinCode: c.joinCode || '',
        branch: c.department || '',
        year: c.academicYear || '',
        className: c.className || '',
        credits: c.credits || 3,
        semester: c.semester || '',
        session: c.session || 'Spring'
      }));
      setCourses(mapped);
    } catch (error) {
      toast.error('Failed to delete class');
      console.error('Delete error:', error);
    }
  };

  const useCurrentLocation = async () => {
    if (!('geolocation' in navigator)) {
      toast.error('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(String(pos.coords.latitude.toFixed(6)));
        setLongitude(String(pos.coords.longitude.toFixed(6)));
        toast.success('Location captured');
      },
      () => toast.error('Unable to fetch location'),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const generateHomeQR = () => {
    // Validate class selection
    const cls = selectedClass || classQuery;
    if (!cls) {
      toast.error('Please select a class');
      return;
    }
    
    // Validate course selection
    if (!selectedQuickCourse) {
      toast.error('Please select a course/subject');
      return;
    }

    // Find the selected course
    const course = courses.find(c => c.id === selectedQuickCourse);
    if (!course) {
      toast.error('Course not found');
      return;
    }

    // Switch to the course view and start session
    setSelectedCourse(course);
    setActiveTab('classes');
    
    // Reset session state
    setQrActive(false);
    setSessionEnded(false);
    setAttendanceList([]);
    
    // Use course-specific students if available
    const courseStudents = course.students?.map(s => ({
      id: s.id,
      name: s.name,
      roll: s.rollNumber,
      status: null as 'present' | 'absent' | null
    })) || students;
    setStudentList(courseStudents);
    
    // Auto-generate QR for the course
    setTimeout(() => {
      setQrActive(true);
      setQrTimer(qrDuration * 60);
      const qrData = JSON.stringify({
        type: 'course-attendance',
        courseId: course.id,
        timestamp: Date.now(),
        expiresIn: qrDuration * 60,
        location: latitude && longitude ? { latitude, longitude, radius: locationRadius } : undefined
      });
      setCourseQRValue(qrData);
      toast.success(`Session started for ${course.courseName}`);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="IIITNR Logo" className="h-12 w-auto bg-white rounded-lg p-1" />
            <div>
              <h1 className="text-2xl font-bold">DSPM IIITNR ATTENDANCE</h1>
              <p className="text-sm opacity-90">{facultyData.name}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-2"
          >
            <LogOut size={20} />
            Logout
          </Button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-card shadow-sm border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => { setActiveTab('home'); setSelectedCourse(null); }}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'home' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => { setActiveTab('classes'); setSelectedCourse(null); }}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'classes' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Classes
            </button>
            <button
              onClick={() => { setActiveTab('timetable'); setSelectedCourse(null); }}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'timetable' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Full Timetable
            </button>
            <button
              onClick={() => { setActiveTab('settings'); setSelectedCourse(null); }}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'settings' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'home' && !selectedCourse && (
          <div className="space-y-8">
            {/* Quick Session Controls */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Start Quick Session</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Class selector with suggestions */}
                <div className="relative" ref={classSelectorRef}>
                  <label className="block text-sm font-medium mb-2">Select Class</label>
                  <Input
                    placeholder="e.g., CSE2024"
                    value={selectedClass ? selectedClass : classQuery}
                    onChange={(e) => { 
                      setSelectedClass(null); 
                      setClassQuery((e.target as HTMLInputElement).value); 
                      setShowClassSuggestions(true);
                      setSelectedQuickCourse(""); // Reset course when class changes
                    }}
                    onFocus={() => setShowClassSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowClassSuggestions(false), 100)}
                    onKeyDown={(e) => { if (e.key === 'Escape') setShowClassSuggestions(false); }}
                  />
                  {showClassSuggestions && (classQuery || !selectedClass) && (
                    <div className="absolute z-10 mt-1 w-full bg-card border rounded-md shadow-lg max-h-48 overflow-auto">
                      {filteredClassOptions.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">No matches</div>
                      ) : filteredClassOptions.map(opt => (
                        <button
                          key={opt}
                          className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                          onClick={() => { 
                            setSelectedClass(opt); 
                            setClassQuery(''); 
                            setShowClassSuggestions(false);
                            
                            // Auto-select course if only one option
                            const matchingCourses = courses.filter(c => c.className === opt);
                            if (matchingCourses.length === 1) {
                              setSelectedQuickCourse(matchingCourses[0].id);
                            } else {
                              setSelectedQuickCourse("");
                            }
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Course/Subject selector */}
                <div>
                  <label className="block text-sm font-medium mb-2">Select Course/Subject</label>
                  <Select 
                    value={selectedQuickCourse} 
                    onValueChange={setSelectedQuickCourse}
                    disabled={!selectedClass && !classQuery}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses
                        .filter(c => {
                          const cls = selectedClass || classQuery;
                          return cls ? c.className === cls : true;
                        })
                        .map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.courseCode} - {course.courseName}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>

                {/* QR Duration */}
                <div>
                  <label className="block text-sm font-medium mb-2">QR Validity (minutes)</label>
                  <Input type="number" min={1} value={qrDuration} onChange={(e) => setQrDuration(Math.max(1, parseInt((e.target as HTMLInputElement).value) || 1))} />
                </div>

                {/* Location coords */}
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium mb-2">Location (optional)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Latitude" value={latitude} onChange={(e) => setLatitude((e.target as HTMLInputElement).value)} />
                    <Input placeholder="Longitude" value={longitude} onChange={(e) => setLongitude((e.target as HTMLInputElement).value)} />
                  </div>
                  <Button variant="outline" className="mt-2" onClick={useCurrentLocation}>Use Current Location</Button>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <Button onClick={generateHomeQR} className="gap-2">
                  <QrCode className="w-4 h-4" /> Start Session
                </Button>
              </div>
            </Card>

            {/* Today's Schedule */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedDay}</h2>
                  <p className="text-sm text-muted-foreground">{now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {days.map(day => (
                    <Button
                      key={day}
                      variant={selectedDay === day ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDay(day)}
                    >
                      {day.slice(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                {facultyData.timetable[selectedDay].length > 0 ? (
                  facultyData.timetable[selectedDay].map((slot, idx) => (
                    <Card key={idx} className="p-4 hover:shadow-md transition-shadow border">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 text-primary font-semibold text-lg">
                            <Clock size={20} />
                            {slot.time}
                          </div>
                          <h3 className="text-xl font-bold mt-2">{slot.course} - {slot.name}</h3>
                          <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            <MapPin size={16} />
                            {slot.room}
                          </p>
                        </div>
                        <Button onClick={() => handleStartSession(slot.course)}>
                          Start Session
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar size={48} className="mx-auto mb-4" />
                    <p>No classes scheduled for {selectedDay}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Recent Sessions */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Recent Sessions</h2>
              <div className="space-y-3">
                {facultyData.recentSessions.map((session, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-semibold">{session.course}</p>
                      <p className="text-sm text-muted-foreground">{session.date} • {session.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{session.attendance}</p>
                      <p className="text-xs text-muted-foreground">Attendance</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'classes' && !selectedCourse && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">My Classes</h2>
              <Button 
                onClick={() => setAddClassDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus size={20} />
                Add Class
              </Button>
            </div>

            {facultyData.courses.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="text-muted-foreground mb-4">
                  <Users size={64} className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No classes registered yet</p>
                  <p className="text-sm mt-2">Click "Add Class" to register your first class</p>
                </div>
                <Button 
                  onClick={() => setAddClassDialogOpen(true)}
                  className="mt-4"
                >
                  <Plus size={20} className="mr-2" />
                  Add Your First Class
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {facultyData.courses.map(course => {
                  // Find next class from timetable
                  const today = new Date();
                  const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];
                  const nextClass = course.timetable?.find(slot => slot.day === currentDay);
                  
                  return (
                    <Card 
                      key={course.id}
                      className="p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-primary/30 relative"
                    >
                      {/* Three-dot menu - positioned absolutely */}
                      <div className="absolute top-4 right-4 z-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical size={18} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive cursor-pointer"
                              onSelect={(e) => {
                                e.preventDefault();
                                handleDeleteClass(course.id, course.courseName);
                              }}
                            >
                              <Trash2 size={16} className="mr-2" />
                              Delete this class
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div onClick={() => setSelectedCourse(course)} className="cursor-pointer">
                        <div className="flex justify-between items-start mb-4 pr-8">
                          <Badge variant="secondary" className="text-sm">
                            {course.courseCode}
                          </Badge>
                          <Badge variant="outline">{course.session || 'Spring'}</Badge>
                        </div>
                      
                      <h3 className="text-xl font-bold mb-2">{course.courseName}</h3>
                      
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex justify-between">
                          <span>Branch & Year:</span>
                          <span className="font-semibold text-foreground">
                            {course.branch || 'CSE'} {course.year || '2024'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span>Credits:</span>
                          <span className="font-semibold text-foreground">{course.credits || 3}</span>
                        </div>
                        
                        {course.semester && (
                          <div className="flex justify-between">
                            <span>Semester:</span>
                            <span className="font-semibold text-foreground">{course.semester}</span>
                          </div>
                        )}
                        
                        {nextClass && (
                          <div className="flex justify-between">
                            <span>Next Class:</span>
                            <span className="font-semibold text-foreground">{nextClass.time}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground pt-3 border-t">
                        <Users size={18} />
                        <span>{course.totalStudents} Students</span>
                      </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
  )}

        {activeTab === 'timetable' && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Weekly Timetable</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 text-left font-semibold bg-muted border">Time</th>
                    {days.map(day => (
                      <th key={day} className="p-3 text-center font-semibold bg-muted border min-w-[120px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Fixed time slots from 9 AM to 6 PM (1-hour slots) */}
                  {(() => {
                    const timeSlots = [
                      '09:00 AM - 10:00 AM',
                      '10:00 AM - 11:00 AM',
                      '11:00 AM - 12:00 PM',
                      '12:00 PM - 01:00 PM',
                      '01:00 PM - 02:00 PM',
                      '02:00 PM - 03:00 PM',
                      '03:00 PM - 04:00 PM',
                      '04:00 PM - 05:00 PM',
                      '05:00 PM - 06:00 PM'
                    ];

                    return timeSlots.map(timeSlot => (
                      <tr key={timeSlot} className="border-b">
                        <td className="p-3 font-medium text-sm bg-muted/30 border align-top whitespace-nowrap">
                          {timeSlot}
                        </td>
                        {days.map(day => {
                          const classInSlot = facultyData.timetable[day].find(
                            slot => slot.time === timeSlot
                          );
                          return (
                            <td 
                              key={day} 
                              className={`p-3 border align-top ${
                                classInSlot ? 'bg-card' : 'bg-muted/20'
                              }`}
                            >
                              {classInSlot ? (
                                <div className="text-sm">
                                  <div className="font-semibold text-primary">
                                    {classInSlot.course}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {classInSlot.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <MapPin size={10} />
                                    {classInSlot.room}
                                  </div>
                                </div>
                              ) : null}
                            </td>
                          );
                        })}
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {selectedCourse && (
          <div className="space-y-6">
            <Button 
              variant="ghost"
              className="flex items-center gap-2 w-fit"
              onClick={() => setSelectedCourse(null)}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Classes
            </Button>

            <Card className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{selectedCourse.courseName}</h2>
                  <p className="text-muted-foreground">{selectedCourse.courseCode} - Section {selectedCourse.section}</p>
                  <p className="text-muted-foreground mt-1 flex items-center gap-2">
                    <Users size={16} />
                    {selectedCourse.totalStudents} Students Enrolled
                  </p>
                </div>
                {selectedCourse.joinCode && (
                  <div className="text-right bg-primary/10 p-4 rounded-lg border-2 border-primary/30">
                    <p className="text-xs text-muted-foreground mb-1">Share with students:</p>
                    <p className="text-3xl font-mono font-bold text-primary tracking-wider">{selectedCourse.joinCode}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedCourse.joinCode || '');
                        toast.success('Join code copied to clipboard!');
                      }}
                    >
                      Copy Code
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* QR Code Section */}
              <div className="lg:col-span-2">
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-6">QR Code Attendance</h3>
                  
                  {!qrActive && !sessionEnded && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            QR Validity (minutes)
                          </label>
                          <Input 
                            type="number"
                            value={qrDuration}
                            onChange={(e) => setQrDuration(Math.max(1, parseInt((e.target as HTMLInputElement).value) || 1))}
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Location Radius (meters)
                          </label>
                          <Input 
                            type="number"
                            value={locationRadius}
                            onChange={(e) => setLocationRadius(Math.min(500, Math.max(5, parseInt((e.target as HTMLInputElement).value) || 25)))}
                            min="5"
                            max="500"
                          />
                        </div>
                      </div>
                      
                      <Button 
                        onClick={generateQR}
                        className="w-full flex items-center justify-center gap-2"
                        size="lg"
                      >
                        <QrCode size={24} />
                        Generate QR Code
                      </Button>
                    </div>
                  )}

                  {qrActive && (
                    <div className="space-y-6">
                      <div className="bg-muted/50 rounded-lg p-8 text-center">
                        <div className="bg-white w-64 h-64 mx-auto rounded-lg shadow-lg flex items-center justify-center mb-4">
                          <QRCodeSVG
                            value={courseQRValue || 'waiting...'}
                            size={240}
                            level="H"
                          />
                        </div>
                        <div className="text-3xl font-bold text-primary mb-2">
                          {formatTime(qrTimer)}
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 mb-4">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${(qrTimer / (qrDuration * 60)) * 100}%` }}
                          />
                        </div>
                        <p className="text-muted-foreground">Time remaining</p>
                        <p className="text-sm text-muted-foreground mt-2">Range: {locationRadius}m</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <Button 
                          onClick={regenerateQR}
                          variant="secondary"
                        >
                          Regenerate QR
                        </Button>
                        <Button 
                          onClick={endSession}
                          variant="destructive"
                        >
                          End Session
                        </Button>
                      </div>
                    </div>
                  )}

                  {sessionEnded && (
                    <div className="space-y-6">
                      <div className="bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-800 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <BarChart3 className="text-green-600" size={32} />
                          <h4 className="text-2xl font-bold">Session Statistics</h4>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mt-6">
                          <Card className="p-4 text-center">
                            <div className="text-3xl font-bold text-primary">{selectedCourse.totalStudents}</div>
                            <div className="text-sm text-muted-foreground mt-1">Total Students</div>
                          </Card>
                          <Card className="p-4 text-center">
                            <div className="text-3xl font-bold text-green-600">{presentCount}</div>
                            <div className="text-sm text-muted-foreground mt-1">Present</div>
                          </Card>
                          <Card className="p-4 text-center">
                            <div className="text-3xl font-bold text-red-600">{absentCount}</div>
                            <div className="text-sm text-muted-foreground mt-1">Absent</div>
                          </Card>
                        </div>
                        
                        <div className="mt-4">
                          <div className="w-full bg-muted rounded-full h-4">
                            <div 
                              className="bg-green-600 h-4 rounded-full"
                              style={{ width: `${(presentCount / selectedCourse.totalStudents) * 100}%` }}
                            />
                          </div>
                          <p className="text-center mt-2 text-muted-foreground">
                            {((presentCount / selectedCourse.totalStudents) * 100).toFixed(1)}% Attendance
                          </p>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => {
                          setSessionEnded(false);
                          setStudentList(students);
                          setAttendanceList([]);
                        }}
                        className="w-full"
                      >
                        Start New Session
                      </Button>
                    </div>
                  )}

                  {/* Manual Search */}
                  <div className="mt-8 pt-8 border-t">
                    <h4 className="text-lg font-bold mb-4">Manual Attendance</h4>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
                      <Input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                        placeholder="Search by name or roll number..."
                        className="pl-10"
                      />
                    </div>
                    
                    {searchQuery && (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {filteredStudents.map(student => (
                          <div key={student.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                              <p className="font-semibold">{student.name}</p>
                              <p className="text-sm text-muted-foreground">{student.roll}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleStudentSearch(student, 'present')}
                                variant={student.status === 'present' ? 'default' : 'outline'}
                                size="sm"
                              >
                                Present
                              </Button>
                              <Button
                                onClick={() => handleStudentSearch(student, 'absent')}
                                variant={student.status === 'absent' ? 'destructive' : 'outline'}
                                size="sm"
                              >
                                Absent
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Live Attendance List */}
              <div>
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">Live Attendance</h3>
                  <div className="space-y-3">
                    {attendanceList.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Users size={48} className="mx-auto mb-4" />
                        <p>No students marked present yet</p>
                      </div>
                    ) : (
                      attendanceList.map(student => (
                        <div key={student.id} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                          <CheckCircle className="text-green-600 mt-1" size={20} />
                          <div className="flex-1">
                            <p className="font-semibold">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.roll}</p>
                            <p className="text-xs text-green-600 mt-1">{student.time}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && !selectedCourse && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Settings</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Default QR Validity (minutes)</label>
                  <Input type="number" min={1} value={qrDuration} onChange={(e) => setQrDuration(Math.max(1, parseInt((e.target as HTMLInputElement).value) || 1))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Default Location Radius (meters)</label>
                  <Input type="number" min={5} max={500} value={locationRadius} onChange={(e) => setLocationRadius(Math.min(500, Math.max(5, parseInt((e.target as HTMLInputElement).value) || 25)))} />
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={() => toast.success('Settings saved')}>Save Changes</Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Contact Info for Students</h2>
              <p className="text-sm text-muted-foreground mb-4">Add contact persons (Faculty/TA) for students to reach</p>
              
              {/* List of existing contacts */}
              {contactPersons.length > 0 && (
                <div className="space-y-3 mb-6">
                  {contactPersons.map((contact) => (
                    <div key={contact.id} className="p-4 bg-muted/50 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{contact.name}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setContactPersons(contactPersons.filter(c => c.id !== contact.id))}
                        >
                          <XCircle size={18} />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Mobile:</span>
                          <span className="ml-2 font-medium">{contact.mobile}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">WhatsApp:</span>
                          <span className="ml-2 font-medium">{contact.whatsapp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new contact form */}
              <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h3 className="font-semibold">Add New Contact</h3>
                <div>
                  <label className="block text-sm font-medium mb-2">Person's Name</label>
                  <Input 
                    type="text" 
                    placeholder="Enter name"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Mobile Number</label>
                    <Input 
                      type="tel" 
                      placeholder="+91 XXXXX XXXXX"
                      value={newContactMobile}
                      onChange={(e) => setNewContactMobile(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">WhatsApp Number</label>
                    <Input 
                      type="tel" 
                      placeholder="+91 XXXXX XXXXX"
                      value={newContactWhatsapp}
                      onChange={(e) => setNewContactWhatsapp(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    if (newContactName && newContactMobile && newContactWhatsapp) {
                      setContactPersons([...contactPersons, {
                        id: Date.now().toString(),
                        name: newContactName,
                        mobile: newContactMobile,
                        whatsapp: newContactWhatsapp
                      }]);
                      setNewContactName('');
                      setNewContactMobile('');
                      setNewContactWhatsapp('');
                      toast.success('Contact added successfully');
                    } else {
                      toast.error('Please fill all fields');
                    }
                  }}
                  className="w-full"
                >
                  <Plus size={18} className="mr-2" />
                  Add Contact
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Add Class Dialog */}
      <AddClassDialog 
        open={addClassDialogOpen}
        onOpenChange={setAddClassDialogOpen}
        onClassAdded={handleClassAdded}
        existingClasses={courses}
      />
    </div>
  );
};

export default Dashboard;
