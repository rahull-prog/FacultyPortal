import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { X, MapPin } from 'lucide-react';
import { createFullClass } from '@/services/api';

interface TimeSlot {
  day: string;
  time: string;
  type: 'theory' | 'lab';
  room?: string;
}

interface AddClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClassAdded: (classData: any) => void;
  existingClasses: any[];
}

export function AddClassDialog({ open, onOpenChange, onClassAdded, existingClasses }: AddClassDialogProps) {
  const [step, setStep] = useState(1);
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [slotType, setSlotType] = useState<'theory' | 'lab'>('theory');
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [credits, setCredits] = useState('3');
  const [semester, setSemester] = useState('');
  const [session, setSession] = useState<'Spring' | 'Autumn'>('Spring');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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

  const branches = ['CSE', 'DSAI', 'ECE'];
  const years = ['2024', '2025', '2026', '2027', '2028', '2029'];

  const handleSlotClick = (day: string, time: string) => {
    const existingSlot = selectedSlots.find(s => s.day === day && s.time === time);
    
    if (existingSlot) {
      // If already selected and current mode differs, update the slot type instead of removing
      if (existingSlot.type !== slotType) {
        setSelectedSlots(selectedSlots.map(s => 
          (s.day === day && s.time === time) ? { ...s, type: slotType } : s
        ));
        return;
      }
      // Same type clicked again -> remove slot (toggle off)
      setSelectedSlots(selectedSlots.filter(s => !(s.day === day && s.time === time)));
    } else {
      // Check if any existing class has this slot
      const hasConflict = existingClasses.some(cls => 
        cls.timetable?.some((slot: any) => 
          slot.day === day && slot.time === time
        )
      );

      if (hasConflict) {
        toast.error('This slot is already occupied by another class!');
        return;
      }

      // Add slot
      setSelectedSlots([...selectedSlots, { day, time, type: slotType }]);
    }
  };

  const isSlotSelected = (day: string, time: string) => {
    return selectedSlots.some(s => s.day === day && s.time === time);
  };

  const isSlotOccupied = (day: string, time: string) => {
    return existingClasses.some(cls => 
      cls.timetable?.some((slot: any) => 
        slot.day === day && slot.time === time
      )
    );
  };

  const getOccupiedSlotInfo = (day: string, time: string) => {
    for (const cls of existingClasses) {
      const slot = cls.timetable?.find((s: any) => s.day === day && s.time === time);
      if (slot) {
        return { code: cls.courseCode, type: slot.type };
      }
    }
    return null;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!branch || !year || !courseName || !courseCode) {
        toast.error('Please fill all required fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (selectedSlots.length === 0) {
        toast.error('Please select at least one time slot');
        return;
      }
      // Move to step 3 where we'll create the class and get the join code
      handleSubmit();
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsCreating(true);
    try {
      console.log('Creating class with payload:', {
        branch,
        year,
        courseName,
        courseCode,
        className: `${branch}${year}`,
        timetable: selectedSlots,
        section: 'A',
        credits: parseInt(credits) || 3,
        semester,
        session
      });
      
      const payload = {
        branch,
        year,
        courseName,
        courseCode,
        className: `${branch}${year}`,
        timetable: selectedSlots,
        section: 'A',
        credits: parseInt(credits) || 3,
        semester,
        session
      };
      const res = await createFullClass(payload);
      
      console.log('Full API Response:', res); // Debug log
      
      // Backend returns { success: true, course: { joinCode, ... } }
      if (res?.course?.joinCode) {
        setJoinCode(res.course.joinCode);
        setStep(3); // Show join code screen
        toast.success('Class created successfully!');
        
        // Notify parent with the returned course
        onClassAdded(res.course);
      } else {
        console.error('No join code in response:', res);
        toast.error('Class created but join code not received. Please check console.');
      }
    } catch (e: any) {
      console.error('Error creating class:', e); // Debug log
      toast.error(e?.body?.error || e?.message || 'Failed to add class');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setBranch('');
    setYear('');
    setCourseName('');
    setCourseCode('');
    setSelectedSlots([]);
    setSlotType('theory');
    setJoinCode('');
    setCredits('3');
    setSemester('');
    setSession('Spring');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Class</DialogTitle>
          <DialogDescription>
            {step === 3 
              ? 'Class created successfully!' 
              : `Step ${step} of 2: ${step === 1 ? 'Basic Information' : 'Timetable'}`
            }
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Branch *</Label>
                <Select value={branch} onValueChange={setBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Year *</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(y => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Course Name *</Label>
              <Input 
                placeholder="e.g., Data Structures and Algorithms"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Course Code *</Label>
              <Input 
                placeholder="e.g., CSE301"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Credits</Label>
                <Input 
                  type="number"
                  placeholder="3"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  min="1"
                  max="6"
                />
              </div>

              <div className="space-y-2">
                <Label>Semester</Label>
                <Input 
                  placeholder="e.g., 1, 2, 3..."
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Session</Label>
                <Select value={session} onValueChange={(v: 'Spring' | 'Autumn') => setSession(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Autumn">Autumn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {branch && year && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Class Name:</span> {branch}{year}
                </p>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label>Select Time Slots</Label>
              <div className="flex gap-2">
                <Button
                  variant={slotType === 'theory' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSlotType('theory')}
                >
                  Theory
                </Button>
                <Button
                  variant={slotType === 'lab' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSlotType('lab')}
                >
                  Lab
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground mb-2">
              Click on time slots to add/remove. Current mode: <span className="font-semibold text-primary">{slotType}</span>
            </div>

            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left font-semibold bg-muted border text-xs">Time</th>
                    {days.map(day => (
                      <th key={day} className="p-2 text-center font-semibold bg-muted border text-xs min-w-[100px]">
                        {day.slice(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(time => (
                    <tr key={time}>
                      <td className="p-2 text-xs bg-muted/30 border font-medium whitespace-nowrap">
                        {time}
                      </td>
                      {days.map(day => {
                        const selected = isSlotSelected(day, time);
                        const occupied = isSlotOccupied(day, time);
                        const occupiedInfo = getOccupiedSlotInfo(day, time);

                        // find the selected slot to show its actual type
                        const selectedSlot = selectedSlots.find(s => s.day === day && s.time === time);
                        return (
                          <td 
                            key={day} 
                            className={`p-1 border cursor-pointer transition-colors ${
                              occupied ? 'bg-red-100 dark:bg-red-950 cursor-not-allowed' :
                              selected ? 'bg-primary/20 hover:bg-primary/30' : 
                              'bg-card hover:bg-muted/50'
                            }`}
                            onClick={() => !occupied && handleSlotClick(day, time)}
                          >
                            {occupied && occupiedInfo ? (
                              <div className="text-xs p-1">
                                <div className="font-semibold text-red-600 dark:text-red-400">
                                  {occupiedInfo.code}
                                </div>
                                <Badge variant="outline" className="text-[10px] mt-1">
                                  {occupiedInfo.type}
                                </Badge>
                              </div>
                            ) : selected ? (
                              <Badge variant="default" className="text-[10px] w-full justify-center">
                                {selectedSlot?.type}
                              </Badge>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedSlots.length > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Selected Slots ({selectedSlots.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSlots.map((slot, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {slot.day.slice(0, 3)} {slot.time.split(' - ')[0]} 
                      <span className="text-xs opacity-70">({slot.type})</span>
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => setSelectedSlots(selectedSlots.filter((_, i) => i !== idx))}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Class Created Successfully!</h3>
              <p className="text-muted-foreground mb-6">
                Share this join code with your students
              </p>
            </div>

            <div className="border-2 border-primary rounded-lg p-6 bg-primary/5">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Join Code</p>
                <div className="text-4xl font-bold tracking-wider text-primary mb-4 font-mono">
                  {joinCode}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(joinCode);
                    toast.success('Join code copied to clipboard!');
                  }}
                >
                  Copy Code
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How students can join:</h4>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                <li>Open the Student App</li>
                <li>Go to "Join Class"</li>
                <li>Enter the join code: <span className="font-mono font-bold">{joinCode}</span></li>
                <li>They will be automatically enrolled in {courseName}</li>
              </ol>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Course: <span className="font-semibold">{courseName} ({courseCode})</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Branch: <span className="font-semibold">{branch}</span> | Year: <span className="font-semibold">{year}</span>
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === 3 ? (
            <Button onClick={() => { onOpenChange(false); resetForm(); }}>
              Done
            </Button>
          ) : (
            <>
              {step > 1 && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              <Button onClick={handleNext} disabled={isCreating}>
                {step === 2 ? (isCreating ? 'Creating...' : 'Create Class') : 'Next'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
