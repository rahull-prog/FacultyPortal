import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { createFullClass } from '@/services/api';

interface TimeSlot {
  day: string;
  time: string;
  type: 'theory' | 'lab';
  branch: string;
  room?: string;
}

interface CreatedClass {
  branch: string;
  joinCode: string;
  courseName: string;
  courseCode: string;
}

interface AddClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClassAdded: (classData: any) => void;
  existingClasses: any[];
}

export function AddClassDialog({ open, onOpenChange, onClassAdded, existingClasses }: AddClassDialogProps) {
  const [step, setStep] = useState(1);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [year, setYear] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [currentMode, setCurrentMode] = useState<{ type: 'theory' | 'lab', branch: string } | null>(null);
  const [createdClasses, setCreatedClasses] = useState<CreatedClass[]>([]);
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
    if (!currentMode) {
      toast.error('Please select a branch and type first');
      return;
    }

    const existingSlot = selectedSlots.find(s => s.day === day && s.time === time && s.branch === currentMode.branch);

    if (existingSlot) {
      // If already selected with same branch but different type, update the type
      if (existingSlot.type !== currentMode.type) {
        setSelectedSlots(selectedSlots.map(s =>
          (s.day === day && s.time === time && s.branch === currentMode.branch)
            ? { ...s, type: currentMode.type }
            : s
        ));
        return;
      }
      // Same type and branch clicked again -> remove slot (toggle off)
      setSelectedSlots(selectedSlots.filter(s => !(s.day === day && s.time === time && s.branch === currentMode.branch)));
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

      // Add slot with branch info
      setSelectedSlots([...selectedSlots, { day, time, type: currentMode.type, branch: currentMode.branch }]);
    }
  };

  const isSlotSelected = (day: string, time: string, branch?: string) => {
    if (branch) {
      return selectedSlots.some(s => s.day === day && s.time === time && s.branch === branch);
    }
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
      if (selectedBranches.length === 0 || !year || !courseName || !courseCode) {
        toast.error('Please fill all required fields and select at least one branch');
        return;
      }
      // Initialize currentMode with first branch and theory type
      setCurrentMode({ type: 'theory', branch: selectedBranches[0] });
      setStep(2);
    } else if (step === 2) {
      if (selectedSlots.length === 0) {
        toast.error('Please select at least one time slot');
        return;
      }
      // Move to step 3 where we'll create the classes
      handleSubmit();
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsCreating(true);
    const newCreatedClasses: CreatedClass[] = [];

    try {
      // Create a class for each selected branch
      for (const branch of selectedBranches) {
        // Filter slots for this branch
        const branchSlots = selectedSlots
          .filter(slot => slot.branch === branch)
          .map(({ day, time, type, room }) => ({ day, time, type, room }));

        if (branchSlots.length === 0) {
          console.log(`Skipping ${branch} - no slots selected`);
          continue;
        }

        console.log(`Creating class for ${branch} with payload:`, {
          branch,
          year,
          courseName,
          courseCode,
          className: `${branch}${year}`,
          timetable: branchSlots,
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
          timetable: branchSlots,
          section: 'A',
          credits: parseInt(credits) || 3,
          semester,
          session
        };

        const res = await createFullClass(payload);

        console.log(`API Response for ${branch}:`, res);

        if (res?.course?.joinCode) {
          newCreatedClasses.push({
            branch,
            joinCode: res.course.joinCode,
            courseName,
            courseCode
          });

          // Notify parent with the returned course
          onClassAdded(res.course);
        } else {
          console.error(`No join code in response for ${branch}:`, res);
          toast.error(`Class created for ${branch} but join code not received.`);
        }
      }

      if (newCreatedClasses.length > 0) {
        setCreatedClasses(newCreatedClasses);
        setStep(3); // Show join codes screen
        toast.success(`Successfully created ${newCreatedClasses.length} class(es)!`);
      } else {
        toast.error('No classes were created. Please check console.');
      }
    } catch (e: any) {
      console.error('Error creating classes:', e);
      toast.error(e?.body?.error || e?.message || 'Failed to create classes');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedBranches([]);
    setYear('');
    setCourseName('');
    setCourseCode('');
    setSelectedSlots([]);
    setCurrentMode(null);
    setCreatedClasses([]);
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
                <Label>Branches * (Select one or more)</Label>
                <div className="flex flex-col space-y-2 border rounded-md p-3">
                  {branches.map(b => (
                    <div key={b} className="flex items-center space-x-2">
                      <Checkbox
                        id={`branch-${b}`}
                        checked={selectedBranches.includes(b)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedBranches([...selectedBranches, b]);
                          } else {
                            setSelectedBranches(selectedBranches.filter(br => br !== b));
                          }
                        }}
                      />
                      <label
                        htmlFor={`branch-${b}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {b}
                      </label>
                    </div>
                  ))}
                </div>
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

            {selectedBranches.length > 0 && year && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Classes to be created:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBranches.map(b => (
                    <Badge key={b} variant="secondary">
                      {b}{year}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Label>Select Time Slots</Label>
              <div className="flex flex-wrap gap-2">
                {selectedBranches.map(branch => (
                  <div key={branch} className="flex gap-1">
                    <Button
                      variant={currentMode?.branch === branch && currentMode?.type === 'theory' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentMode({ type: 'theory', branch })}
                    >
                      {branch} Theory
                    </Button>
                    <Button
                      variant={currentMode?.branch === branch && currentMode?.type === 'lab' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentMode({ type: 'lab', branch })}
                    >
                      {branch} Lab
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-muted-foreground mb-2">
              Click on time slots to add/remove. Current mode:
              {currentMode ? (
                <span className="font-semibold text-primary">
                  {currentMode.branch} {currentMode.type}
                </span>
              ) : (
                <span className="text-red-500">Please select a branch and type above</span>
              )}
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
                        const slotsAtThisTime = selectedSlots.filter(s => s.day === day && s.time === time);
                        const selected = slotsAtThisTime.length > 0;
                        const occupied = isSlotOccupied(day, time);
                        const occupiedInfo = getOccupiedSlotInfo(day, time);

                        return (
                          <td
                            key={day}
                            className={`p-1 border cursor-pointer transition-colors ${occupied ? 'bg-red-100 dark:bg-red-950 cursor-not-allowed' :
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
                              <div className="flex flex-col gap-0.5">
                                {slotsAtThisTime.map((slot, idx) => (
                                  <Badge key={idx} variant="default" className="text-[9px] w-full justify-center py-0">
                                    {slot.branch} {slot.type.charAt(0).toUpperCase()}
                                  </Badge>
                                ))}
                              </div>
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
                      {slot.branch} | {slot.day.slice(0, 3)} {slot.time.split(' - ')[0]}
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
              <h3 className="text-xl font-semibold mb-2">
                {createdClasses.length} Class{createdClasses.length > 1 ? 'es' : ''} Created Successfully!
              </h3>
              <p className="text-muted-foreground mb-6">
                Share these join codes with your students
              </p>
            </div>

            <div className="space-y-3">
              {createdClasses.map((cls, idx) => (
                <div key={idx} className="border-2 border-primary rounded-lg p-4 bg-primary/5">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      {cls.branch} - {cls.courseName} ({cls.courseCode})
                    </p>
                    <div className="text-2xl font-bold tracking-wider text-primary mb-2 font-mono">
                      {cls.joinCode}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(cls.joinCode);
                        toast.success(`Join code for ${cls.branch} copied!`);
                      }}
                    >
                      Copy Code
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How students can join:</h4>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                <li>Open the Student App</li>
                <li>Go to "Join Class"</li>
                <li>Enter the join code for their branch</li>
                <li>They will be automatically enrolled in {courseName}</li>
              </ol>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Course: <span className="font-semibold">{courseName} ({courseCode})</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Year: <span className="font-semibold">{year}</span>
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
