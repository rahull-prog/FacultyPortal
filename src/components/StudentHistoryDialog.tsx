import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, Minus } from "lucide-react";
import { format } from "date-fns";

interface Session {
    id: string;
    date: string | Date;
    startTime: string;
    roomNumber?: string;
    type?: 'Theory' | 'Lab';
}

interface StudentHistoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student: {
        id: number | string;
        name: string;
        rollNo: string;
        attendancePercentage: number;
        sessions: Record<string, 'present' | 'absent'>;
    } | null;
    sessions: Session[];
}

export const StudentHistoryDialog = ({ open, onOpenChange, student, sessions }: StudentHistoryDialogProps) => {
    if (!student) return null;

    // Sort sessions by date descending (newest first)
    const sortedSessions = [...sessions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>{student.name}</span>
                        <Badge variant={student.attendancePercentage >= 75 ? "default" : "destructive"}>
                            {student.attendancePercentage}% Attendance
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Roll No: {student.rollNo} • Total Sessions: {sessions.length}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 mt-4">
                    <div className="space-y-4 pr-4">
                        <table className="w-full border-collapse text-sm">
                            <thead className="bg-muted/50 sticky top-0">
                                <tr>
                                    <th className="text-left py-2 px-3 font-medium">Date</th>
                                    <th className="text-left py-2 px-3 font-medium">Day</th>
                                    <th className="text-left py-2 px-3 font-medium">Type</th>
                                    <th className="text-left py-2 px-3 font-medium">Time</th>
                                    <th className="text-center py-2 px-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedSessions.map((session) => {
                                    const status = student.sessions[session.id] || 'absent';
                                    const date = new Date(session.date);

                                    return (
                                        <tr key={session.id} className="border-b hover:bg-muted/30">
                                            <td className="py-3 px-3">
                                                {format(date, 'MMM d, yyyy')}
                                            </td>
                                            <td className="py-3 px-3">
                                                {format(date, 'EEEE')}
                                            </td>
                                            <td className="py-3 px-3">
                                                <Badge variant="outline" className="capitalize">
                                                    {session.type || 'Theory'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-3 text-muted-foreground">
                                                {session.startTime}
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${status === 'present'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {status === 'present' ? (
                                                        <>
                                                            <CheckCircle className="w-3.5 h-3.5" />
                                                            Present
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-3.5 h-3.5" />
                                                            Absent
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};
