import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  X, 
  Lock, 
  Unlock, 
  MapPin, 
  Users,
  Clock,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface ScannedStudent {
  id: string;
  name: string;
  rollNumber: string;
  timestamp: string;
}

const QRSession = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  const [qrValue, setQrValue] = useState("");
  const [scanningEnabled, setScanningEnabled] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(60000);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [scannedStudents, setScannedStudents] = useState<ScannedStudent[]>([]);
  const [geofenceStatus, setGeofenceStatus] = useState<"active" | "warning" | "error">("active");
  const [locationAccuracy, setLocationAccuracy] = useState(8);

  // Mock class data
  const classData = {
    courseCode: "CS101",
    courseName: "Data Structures",
    section: "A",
    totalStudents: 45,
    room: "Lab 201"
  };

  // Generate initial QR code
  useEffect(() => {
    generateNewQR();
  }, []);

  // Handle QR refresh timer
  useEffect(() => {
    if (!refreshInterval || !scanningEnabled) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          generateNewQR();
          return refreshInterval / 1000;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refreshInterval, scanningEnabled]);

  // Simulate geolocation monitoring
  useEffect(() => {
    const checkLocation = setInterval(() => {
      const accuracy = Math.random() * 15 + 3;
      setLocationAccuracy(Math.round(accuracy));
      
      if (accuracy > 10) {
        setGeofenceStatus("warning");
      } else {
        setGeofenceStatus("active");
      }
    }, 5000);

    return () => clearInterval(checkLocation);
  }, []);

  const generateNewQR = () => {
    const timestamp = Date.now();
    const sessionData = {
      classId,
      timestamp,
      enabled: scanningEnabled
    };
    setQrValue(JSON.stringify(sessionData));
    if (refreshInterval) {
      setTimeRemaining(refreshInterval / 1000);
    }
  };

  const handleToggleScanning = () => {
    setScanningEnabled(!scanningEnabled);
    generateNewQR();
    toast.success(!scanningEnabled ? "Scanning enabled" : "Scanning disabled");
  };

  const handleEndSession = () => {
    if (window.confirm("Are you sure you want to end this session?")) {
      toast.success("Session ended successfully");
      navigate("/");
    }
  };

  const handleManualMark = () => {
    navigate(`/manual-marking/${classId}?fromSession=true`);
  };

  // Simulate student scanning
  const simulateScan = () => {
    if (!scanningEnabled) {
      toast.error("Scanning is currently disabled");
      return;
    }

    const mockStudent: ScannedStudent = {
      id: `student_${Date.now()}`,
      name: `Student ${scannedStudents.length + 1}`,
      rollNumber: `2024${String(scannedStudents.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toLocaleTimeString()
    };

    setScannedStudents([mockStudent, ...scannedStudents]);
    toast.success(`${mockStudent.name} marked present`);
  };

  const getGeofenceColor = () => {
    switch (geofenceStatus) {
      case "active":
        return "text-success";
      case "warning":
        return "text-warning";
      case "error":
        return "text-destructive";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {classData.courseCode} - Section {classData.section}
              </h1>
              <p className="text-sm text-muted-foreground">{classData.courseName}</p>
            </div>
          </div>
          <Badge variant="secondary">
            <Users className="w-4 h-4 mr-2" />
            {scannedStudents.length} / {classData.totalStudents}
          </Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - QR Code */}
          <div className="flex flex-col items-center">
            <Card 
              className={`p-8 w-full max-w-md transition-all ${
                scanningEnabled 
                  ? "border-4 border-accent shadow-xl" 
                  : "border-2 border-muted"
              }`}
            >
              {/* Scanning Status */}
              <div className="text-center mb-6">
                <Badge 
                  className={`text-sm ${
                    scanningEnabled 
                      ? "bg-accent text-accent-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {scanningEnabled ? "Scanning Active" : "Scanning Disabled"}
                </Badge>
              </div>

              {/* QR Code */}
              <div className="bg-qr-background p-8 rounded-3xl mb-6 flex items-center justify-center">
                {qrValue ? (
                  <QRCodeSVG
                    value={qrValue}
                    size={280}
                    level="H"
                    includeMargin={false}
                  />
                ) : (
                  <div className="w-[280px] h-[280px] bg-muted animate-pulse rounded-lg" />
                )}
              </div>

              {/* Timer */}
              {refreshInterval && scanningEnabled && (
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-foreground">
                    {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Until QR refresh
                  </p>
                </div>
              )}

              {/* Controls */}
              <div className="space-y-4 w-full">
                <Button
                  className="w-full h-14 text-lg"
                  variant={scanningEnabled ? "destructive" : "default"}
                  onClick={handleToggleScanning}
                >
                  {scanningEnabled ? (
                    <>
                      <Lock className="w-6 h-6 mr-2" />
                      Disable Scanning
                    </>
                  ) : (
                    <>
                      <Unlock className="w-6 h-6 mr-2" />
                      Enable Scanning
                    </>
                  )}
                </Button>

                {/* Refresh Interval Selector */}
                <Card className="p-4">
                  <p className="text-sm font-medium text-foreground mb-3">QR Refresh Interval</p>
                  <div className="flex gap-2">
                    <Button
                      variant={refreshInterval === 30000 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRefreshInterval(30000)}
                      className="flex-1"
                    >
                      30s
                    </Button>
                    <Button
                      variant={refreshInterval === 60000 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRefreshInterval(60000)}
                      className="flex-1"
                    >
                      60s
                    </Button>
                    <Button
                      variant={refreshInterval === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRefreshInterval(null)}
                      className="flex-1"
                    >
                      Never
                    </Button>
                  </div>
                </Card>

                {/* Demo Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={simulateScan}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Simulate Student Scan
                </Button>
              </div>
            </Card>

            {/* Geofence Status */}
            <Card className="p-4 w-full max-w-md mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className={`w-5 h-5 ${getGeofenceColor()}`} />
                  <span className="text-sm font-medium text-foreground">Geofence Status</span>
                </div>
                <Badge variant="outline" className={getGeofenceColor()}>
                  {geofenceStatus === "active" ? "Active" : "Low Accuracy"}
                  {" "}(±{locationAccuracy}m)
                </Badge>
              </div>
            </Card>
          </div>

          {/* Right Column - Live Attendance */}
          <div>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Live Attendance</h2>
                <Badge variant="secondary">
                  {scannedStudents.length} present
                </Badge>
              </div>

              {scannedStudents.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No students scanned yet
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Enable scanning to start marking attendance
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {scannedStudents.map((student) => (
                    <Card key={student.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-success">Present</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {student.timestamp}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={handleManualMark}
              >
                Add/Remove Students Manually
              </Button>
              <Button
                variant="destructive"
                className="w-full h-12"
                onClick={handleEndSession}
              >
                <X className="w-5 h-5 mr-2" />
                End Session
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QRSession;
