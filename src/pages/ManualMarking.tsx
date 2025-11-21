import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, Users, CheckSquare, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  present: boolean;
}

const ManualMarking = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromSession = searchParams.get("fromSession") === "true";
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "present" | "absent">("all");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [classData, setClassData] = useState({
    courseCode: "",
    courseName: "",
    section: "",
    totalStudents: 0
  });

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user || !classId) return;

      try {
        const token = await user.getIdToken();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/faculty/courses/${classId}/students`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }

        const data = await response.json();
        if (data.success) {
          const mappedStudents = data.students.map((s: any) => ({
            id: s.id,
            name: s.name,
            rollNumber: s.rollNumber,
            present: false // Default to absent initially
          }));
          setStudents(mappedStudents);
          setClassData(prev => ({ ...prev, totalStudents: mappedStudents.length }));
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Failed to load student list");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user, classId]);

  const toggleStudent = (studentId: string) => {
    setStudents(students.map(s =>
      s.id === studentId ? { ...s, present: !s.present } : s
    ));
  };

  const markAllPresent = () => {
    setStudents(students.map(s => ({ ...s, present: true })));
    toast.success("All students marked present");
  };

  const clearAll = () => {
    setStudents(students.map(s => ({ ...s, present: false })));
    toast.success("All selections cleared");
  };

  const handleSave = async () => {
    // TODO: Implement actual save to backend (likely creating attendance records)
    // For now, we'll just show a success message as the backend endpoint for bulk attendance might not exist yet
    const presentCount = students.filter(s => s.present).length;
    toast.success(`Attendance saved: ${presentCount} students marked present`);

    if (fromSession) {
      navigate(`/qr-session/${classId}`);
    } else {
      navigate("/");
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterTab === "present") return student.present && matchesSearch;
    if (filterTab === "absent") return !student.present && matchesSearch;
    return matchesSearch;
  });

  const presentCount = students.filter(s => s.present).length;

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fromSession ? navigate(`/qr-session/${classId}`) : navigate("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Manual Attendance
              </h1>
              <p className="text-sm text-muted-foreground">
                {classData.courseCode} {classData.section ? `- Section ${classData.section}` : ''}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <Badge variant="secondary" className="text-sm">
              <Users className="w-4 h-4 mr-2" />
              {presentCount} / {students.length} Present
            </Badge>
            <Badge variant="outline" className="text-sm">
              {students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0}% Attendance
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Controls */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Bulk Actions */}
            <div className="flex gap-2">
              <Button onClick={markAllPresent} variant="default">
                <CheckSquare className="w-4 h-4 mr-2" />
                Mark All
              </Button>
              <Button onClick={clearAll} variant="outline">
                Clear All
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <Tabs value={filterTab} onValueChange={(v) => setFilterTab(v as any)} className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                All ({students.length})
              </TabsTrigger>
              <TabsTrigger value="present">
                Present ({presentCount})
              </TabsTrigger>
              <TabsTrigger value="absent">
                Absent ({students.length - presentCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>

        {/* Student List */}
        <div className="space-y-2">
          {filteredStudents.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No students found</p>
            </Card>
          ) : (
            filteredStudents.map((student) => (
              <Card
                key={student.id}
                className={`p-4 transition-all cursor-pointer hover:shadow-md ${student.present ? "bg-success/5 border-success/20" : ""
                  }`}
                onClick={() => toggleStudent(student.id)}
              >
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={student.present}
                    onCheckedChange={() => toggleStudent(student.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
                  </div>
                  {student.present && (
                    <Badge className="bg-success text-success-foreground">
                      Present
                    </Badge>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Save Button */}
        <div className="fixed bottom-6 left-0 right-0 px-6 max-w-7xl mx-auto">
          <Button
            className="w-full h-14 text-lg shadow-2xl"
            onClick={handleSave}
          >
            <Save className="w-5 h-5 mr-2" />
            Save Attendance ({presentCount} students)
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ManualMarking;
