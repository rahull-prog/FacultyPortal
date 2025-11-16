import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Search, Users, CheckSquare, Save } from "lucide-react";
import { toast } from "sonner";

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

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "present" | "absent">("all");
  const [students, setStudents] = useState<Student[]>([
    { id: "1", name: "Aarav Sharma", rollNumber: "2024001", present: false },
    { id: "2", name: "Diya Patel", rollNumber: "2024002", present: false },
    { id: "3", name: "Arjun Singh", rollNumber: "2024003", present: false },
    { id: "4", name: "Ananya Kumar", rollNumber: "2024004", present: false },
    { id: "5", name: "Vihaan Gupta", rollNumber: "2024005", present: false },
    { id: "6", name: "Isha Reddy", rollNumber: "2024006", present: false },
    { id: "7", name: "Aditya Verma", rollNumber: "2024007", present: false },
    { id: "8", name: "Kavya Iyer", rollNumber: "2024008", present: false },
    { id: "9", name: "Rohan Desai", rollNumber: "2024009", present: false },
    { id: "10", name: "Saanvi Mehta", rollNumber: "2024010", present: false },
  ]);

  const classData = {
    courseCode: "CS101",
    courseName: "Data Structures",
    section: "A",
    totalStudents: students.length
  };

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

  const handleSave = () => {
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
                {classData.courseCode} - Section {classData.section}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <Badge variant="secondary" className="text-sm">
              <Users className="w-4 h-4 mr-2" />
              {presentCount} / {classData.totalStudents} Present
            </Badge>
            <Badge variant="outline" className="text-sm">
              {Math.round((presentCount / classData.totalStudents) * 100)}% Attendance
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
                className={`p-4 transition-all cursor-pointer hover:shadow-md ${
                  student.present ? "bg-success/5 border-success/20" : ""
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
