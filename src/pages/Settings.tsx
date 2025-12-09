import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, Shield, User, LogOut, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { auth } from "@/firebaseConfig";
import { createFacultyProfile } from "@/services/api";

const Settings = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    // Load current user data
    const user = auth.currentUser;
    if (user) {
      setContactInfo({
        name: user.displayName || "",
        email: user.email || "",
        phone: "",
      });
    }
  }, []);

  const handleSaveContact = async () => {
    if (!contactInfo.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSaving(true);
    try {
      await createFacultyProfile({
        name: contactInfo.name,
        email: contactInfo.email,
        phone: contactInfo.phone,
        mobile: contactInfo.phone, // Use same phone for mobile
      });

      toast.success("Contact information saved successfully!");
    } catch (error: any) {
      console.error("Error saving contact info:", error);
      toast.error(error.message || "Failed to save contact information");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    toast.success("Logged out successfully");
    // Handle logout logic here
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Contact Info for Students */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Contact Info for Students
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            This information will be displayed to students in your course cards
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Dr. John Smith"
                value={contactInfo.name}
                onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.smith@iiitnr.edu.in"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Contact Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 9876543210"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleSaveContact}
              disabled={isSaving}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Contact Information"}
            </Button>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Exception Requests</p>
                <p className="text-sm text-muted-foreground">Get notified of new exception requests</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Low Attendance Alerts</p>
                <p className="text-sm text-muted-foreground">Alert when students fall below threshold</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Class Reminders</p>
                <p className="text-sm text-muted-foreground">Remind before upcoming classes</p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        {/* QR Settings */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            QR Session Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Auto-enable Geofencing</p>
                <p className="text-sm text-muted-foreground">Automatically enable location verification</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Show Student Photos</p>
                <p className="text-sm text-muted-foreground">Display photos in attendance lists</p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        {/* Account Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Account
          </h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
