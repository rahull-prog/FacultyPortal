// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { 
//   LayoutDashboard, 
//   ClipboardCheck, 
//   BarChart3, 
//   Settings,
//   Clock,
//   Users,
//   MapPin,
//   Play,
//   CheckSquare
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";

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

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("home");

//   // Mock data for today's classes
//   const todayClasses: ClassSession[] = [
//     {
//       id: "1",
//       courseCode: "CS101",
//       courseName: "Data Structures",
//       section: "A",
//       time: "09:00 AM - 10:00 AM",
//       room: "Lab 201",
//       totalStudents: 45,
//       status: "ongoing",
//       attendancePercentage: 0
//     },
//     {
//       id: "2",
//       courseCode: "CS101",
//       courseName: "Data Structures",
//       section: "B",
//       time: "10:00 AM - 11:00 AM",
//       room: "Lab 202",
//       totalStudents: 42,
//       status: "upcoming"
//     },
//     {
//       id: "3",
//       courseCode: "CS201",
//       courseName: "Algorithms",
//       section: "A",
//       time: "02:00 PM - 03:00 PM",
//       room: "Room 305",
//       totalStudents: 38,
//       status: "upcoming"
//     }
//   ];

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "ongoing":
//         return "bg-accent text-accent-foreground";
//       case "upcoming":
//         return "bg-muted text-muted-foreground";
//       case "completed":
//         return "bg-success text-success-foreground";
//       default:
//         return "bg-muted text-muted-foreground";
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background pb-20">
//       {/* Header */}
//       <header className="bg-card border-b border-border px-6 py-4">
//         <div className="max-w-7xl mx-auto">
//           <h1 className="text-2xl font-bold text-foreground">Faculty Dashboard</h1>
//           <p className="text-sm text-muted-foreground mt-1">
//             {new Date().toLocaleDateString('en-US', { 
//               weekday: 'long', 
//               year: 'numeric', 
//               month: 'long', 
//               day: 'numeric' 
//             })}
//           </p>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-6 py-6">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-xl font-semibold text-foreground">Today's Classes</h2>
//           <Badge variant="secondary" className="text-sm">
//             {todayClasses.length} classes
//           </Badge>
//         </div>

//         {/* Class Cards */}
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//           {todayClasses.map((classItem) => (
//             <Card key={classItem.id} className="p-6 hover:shadow-lg transition-shadow">
//               {/* Card Header */}
//               <div className="flex items-start justify-between mb-4">
//                 <div>
//                   <h3 className="text-lg font-semibold text-foreground">
//                     {classItem.courseCode}
//                   </h3>
//                   <p className="text-sm text-muted-foreground">{classItem.courseName}</p>
//                   <Badge className="mt-2" variant="outline">
//                     Section {classItem.section}
//                   </Badge>
//                 </div>
//                 <Badge className={getStatusColor(classItem.status)}>
//                   {classItem.status}
//                 </Badge>
//               </div>

//               {/* Class Details */}
//               <div className="space-y-2 mb-4">
//                 <div className="flex items-center text-sm text-muted-foreground">
//                   <Clock className="w-4 h-4 mr-2" />
//                   {classItem.time}
//                 </div>
//                 <div className="flex items-center text-sm text-muted-foreground">
//                   <MapPin className="w-4 h-4 mr-2" />
//                   {classItem.room}
//                 </div>
//                 <div className="flex items-center text-sm text-muted-foreground">
//                   <Users className="w-4 h-4 mr-2" />
//                   {classItem.totalStudents} students
//                 </div>
//               </div>

//               {/* Attendance Percentage (if available) */}
//               {classItem.attendancePercentage !== undefined && (
//                 <div className="mb-4">
//                   <div className="flex items-center justify-between text-sm mb-1">
//                     <span className="text-muted-foreground">Attendance</span>
//                     <span className="font-medium text-foreground">
//                       {classItem.attendancePercentage}%
//                     </span>
//                   </div>
//                   <div className="w-full bg-muted rounded-full h-2">
//                     <div 
//                       className="bg-accent rounded-full h-2 transition-all"
//                       style={{ width: `${classItem.attendancePercentage}%` }}
//                     />
//                   </div>
//                 </div>
//               )}

//               {/* Actions */}
//               <div className="flex gap-2">
//                 {(classItem.status === "upcoming" || classItem.status === "ongoing") && (
//                   <Button
//                     className="flex-1"
//                     onClick={() => navigate(`/qr-session/${classItem.id}`)}
//                   >
//                     <Play className="w-4 h-4 mr-2" />
//                     Start Class
//                   </Button>
//                 )}
//                 <Button
//                   variant="outline"
//                   className="flex-1"
//                   onClick={() => navigate(`/manual-marking/${classItem.id}`)}
//                 >
//                   <CheckSquare className="w-4 h-4 mr-2" />
//                   Mark
//                 </Button>
//               </div>
//             </Card>
//           ))}
//         </div>
//       </main>

//       {/* Bottom Navigation */}
//       <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="flex items-center justify-around py-2">
//             <button
//               onClick={() => setActiveTab("home")}
//               className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
//                 activeTab === "home" 
//                   ? "text-primary" 
//                   : "text-muted-foreground hover:text-foreground"
//               }`}
//             >
//               <LayoutDashboard className="w-6 h-6" />
//               <span className="text-xs font-medium">Home</span>
//             </button>
            
//             <button
//               onClick={() => {
//                 setActiveTab("mark");
//                 navigate("/manual-marking");
//               }}
//               className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
//                 activeTab === "mark" 
//                   ? "text-primary" 
//                   : "text-muted-foreground hover:text-foreground"
//               }`}
//             >
//               <ClipboardCheck className="w-6 h-6" />
//               <span className="text-xs font-medium">Mark</span>
//             </button>
            
//             <button
//               onClick={() => {
//                 setActiveTab("reports");
//                 navigate("/reports");
//               }}
//               className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
//                 activeTab === "reports" 
//                   ? "text-primary" 
//                   : "text-muted-foreground hover:text-foreground"
//               }`}
//             >
//               <BarChart3 className="w-6 h-6" />
//               <span className="text-xs font-medium">Reports</span>
//             </button>
            
//             <button
//               onClick={() => {
//                 setActiveTab("settings");
//                 navigate("/settings");
//               }}
//               className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
//                 activeTab === "settings" 
//                   ? "text-primary" 
//                   : "text-muted-foreground hover:text-foreground"
//               }`}
//             >
//               <Settings className="w-6 h-6" />
//               <span className="text-xs font-medium">Settings</span>
//             </button>
//           </div>
//         </div>
//       </nav>
//     </div>
//   );
// };

// export default Dashboard;
