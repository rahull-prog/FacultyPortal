import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Download, TrendingDown, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";

const Reports = () => {
  const navigate = useNavigate();
  const [timePeriod, setTimePeriod] = useState("monthly");
  const [selectedClass, setSelectedClass] = useState("all");

  // Mock data
  const trendData = [
    { date: "Week 1", attendance: 85 },
    { date: "Week 2", attendance: 88 },
    { date: "Week 3", attendance: 82 },
    { date: "Week 4", attendance: 90 },
  ];

  const classData = [
    { class: "CS101-A", attendance: 88, total: 45 },
    { class: "CS101-B", attendance: 85, total: 42 },
    { class: "CS201-A", attendance: 92, total: 38 },
  ];

  const atRiskStudents = [
    { name: "Rahul Verma", rollNumber: "2024015", attendance: 68, class: "CS101-A" },
    { name: "Priya Sharma", rollNumber: "2024023", attendance: 72, class: "CS101-B" },
    { name: "Amit Kumar", rollNumber: "2024031", attendance: 70, class: "CS201-A" },
  ];

  const handleExport = (format: string) => {
    toast.success(`Exporting report as ${format.toUpperCase()}...`);
  };

  const overallAttendance = 88;
  const attendanceTrend = 5;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="semester">Semester</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="cs101a">CS101 - Section A</SelectItem>
                <SelectItem value="cs101b">CS101 - Section B</SelectItem>
                <SelectItem value="cs201a">CS201 - Section A</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExport("pdf")}>
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" onClick={() => handleExport("excel")}>
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Overall Attendance</h3>
              <Badge className="bg-primary text-primary-foreground">
                <Users className="w-4 h-4 mr-1" />
                All
              </Badge>
            </div>
            <p className="text-4xl font-bold text-foreground mb-1">{overallAttendance}%</p>
            <div className="flex items-center gap-2">
              {attendanceTrend > 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm text-success">+{attendanceTrend}% from last period</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">{attendanceTrend}% from last period</span>
                </>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Classes</h3>
            </div>
            <p className="text-4xl font-bold text-foreground mb-1">3</p>
            <p className="text-sm text-muted-foreground">Active sections</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">At-Risk Students</h3>
            </div>
            <p className="text-4xl font-bold text-warning mb-1">{atRiskStudents.length}</p>
            <p className="text-sm text-muted-foreground">Below 75% attendance</p>
          </Card>
        </div>

        {/* Attendance Trend Chart */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Attendance Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="attendance" 
                stroke="hsl(var(--secondary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--secondary))', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Class-wise Comparison */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Class-wise Attendance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="class" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="attendance" 
                fill="hsl(var(--primary))" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* At-Risk Students */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">At-Risk Students</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Students with attendance below 75% threshold
          </p>
          
          {atRiskStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No at-risk students</p>
            </div>
          ) : (
            <div className="space-y-3">
              {atRiskStudents.map((student) => (
                <Card key={student.rollNumber} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {student.class}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-warning text-warning-foreground text-lg font-bold mb-1">
                        {student.attendance}%
                      </Badge>
                      <p className="text-xs text-muted-foreground">Attendance</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Reports;
