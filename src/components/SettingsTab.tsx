import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Save, Edit2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createFacultyProfile } from "@/services/api";
import { auth } from "@/firebaseConfig";

interface SettingsTabProps {
    qrDuration: number;
    setQrDuration: (value: number) => void;
    locationRadius: number;
    setLocationRadius: (value: number) => void;
}

export const SettingsTab = ({ qrDuration, setQrDuration, locationRadius, setLocationRadius }: SettingsTabProps) => {
    const [contactInfo, setContactInfo] = useState({
        name: "",
        email: "",
        phone: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved contact info on mount
    useEffect(() => {
        const loadContactInfo = async () => {
            try {
                const token = await auth.currentUser?.getIdToken();
                if (!token) {
                    setIsLoading(false);
                    return;
                }

                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}/api/faculty/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.faculty) {
                        setContactInfo({
                            name: data.faculty.name || "",
                            email: data.faculty.email || "",
                            phone: data.faculty.phone || data.faculty.mobile || "",
                        });
                    }
                }
            } catch (error) {
                console.error('Error loading contact info:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadContactInfo();
    }, []);

    const handleSaveContact = async () => {
        if (!contactInfo.name.trim()) {
            toast.error('Name is required');
            return;
        }

        setIsSaving(true);
        try {
            await createFacultyProfile({
                name: contactInfo.name,
                email: contactInfo.email,
                phone: contactInfo.phone,
                mobile: contactInfo.phone,
            });

            toast.success('Contact information saved successfully!');
            setIsEditing(false);
        } catch (error: any) {
            console.error('Error saving contact:', error);
            toast.error(error.message || 'Failed to save contact information');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Settings</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Default QR Validity (minutes)</label>
                        <Input
                            type="number"
                            min={1}
                            value={qrDuration}
                            onChange={(e) => setQrDuration(Math.max(1, parseInt(e.target.value) || 1))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Default Location Radius (meters)</label>
                        <Input
                            type="number"
                            min={5}
                            max={2000}
                            value={locationRadius}
                            onChange={(e) => setLocationRadius(Math.min(2000, Math.max(5, parseInt(e.target.value) || 25)))}
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <Button onClick={() => toast.success('Settings saved')}>Save Changes</Button>
                </div>
            </Card>

            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Contact Info for Students</h2>
                    {!isEditing && !isLoading && (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    )}
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                    This information will be displayed to students in your course cards
                </p>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Loading...</span>
                    </div>
                ) : isEditing ? (
                    // Edit Mode
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Full Name *</label>
                            <Input
                                type="text"
                                placeholder="Dr. John Smith"
                                value={contactInfo.name}
                                onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Email Address</label>
                            <Input
                                type="email"
                                placeholder="john.smith@iiitnr.edu.in"
                                value={contactInfo.email}
                                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Contact Number</label>
                            <Input
                                type="tel"
                                placeholder="+91 9876543210"
                                value={contactInfo.phone}
                                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleSaveContact}
                                disabled={isSaving}
                                className="flex-1"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {isSaving ? "Saving..." : "Save"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    // Display Mode
                    <div className="bg-muted/30 rounded-lg p-4 border-2 border-dashed">
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Name</p>
                                <p className="font-semibold">
                                    {contactInfo.name || <span className="text-muted-foreground italic">Not set</span>}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Email</p>
                                <p className="text-sm">
                                    {contactInfo.email || <span className="text-muted-foreground italic">Not set</span>}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Phone</p>
                                <p className="text-sm">
                                    {contactInfo.phone || <span className="text-muted-foreground italic">Not set</span>}
                                </p>
                            </div>
                        </div>

                        {!contactInfo.name && !contactInfo.email && !contactInfo.phone && (
                            <p className="text-sm text-muted-foreground mt-4 text-center">
                                Click "Edit" to add your contact information
                            </p>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
};
