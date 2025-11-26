import { Card } from '@/components/ui/card';
import { Users, CheckCircle, XCircle, Minus } from 'lucide-react';

interface Student {
    id: number | string;
    name: string;
    roll: string;
    status: 'present' | 'absent' | null;
}

interface EnrolledStudentsListProps {
    students: Student[];
    totalStudents: number;
}

export const EnrolledStudentsList = ({ students, totalStudents }: EnrolledStudentsListProps) => {
    return (
        <Card className="p-6">
            <h3 className="text-xl font-bold mb-6">Enrolled Students ({totalStudents})</h3>

            {students.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <Users size={48} className="mx-auto mb-4" />
                    <p>No students enrolled yet</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b-2">
                                <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                                    Student
                                </th>
                                <th className="border-l border-border w-px"></th>
                                {Array.from({ length: 7 }, (_, i) => {
                                    const date = new Date();
                                    date.setDate(date.getDate() - (6 - i));
                                    return (
                                        <th key={i} className="text-center py-3 px-2 font-medium text-xs text-muted-foreground">
                                            {date.getDate()}/{date.getMonth() + 1}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => {
                                // FIXED: Use stable mock data based on student ID to prevent flickering
                                // and use REAL status for the current day (last column)
                                const studentIdNum = typeof student.id === 'string'
                                    ? parseInt(student.id.replace(/\D/g, '') || '0')
                                    : student.id;

                                const attendanceHistory = Array.from({ length: 6 }, (_, i) => {
                                    // Stable mock pattern: mostly present, deterministic based on ID
                                    return ((studentIdNum + i) % 5 === 0) ? 'absent' : 'present';
                                });

                                // Add today's real status
                                attendanceHistory.push(student.status || 'unknown');

                                const validHistory = attendanceHistory.filter(a => a !== 'unknown');
                                const attendancePercentage = validHistory.length > 0
                                    ? Math.round((validHistory.filter(a => a === 'present').length / validHistory.length) * 100)
                                    : 0;

                                return (
                                    <tr key={student.id} className="border-b hover:bg-muted/30 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm">{student.name}</p>
                                                    <p className="text-xs text-muted-foreground">{student.roll}</p>
                                                </div>
                                                <span className={`text-sm font-bold whitespace-nowrap ${attendancePercentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {attendancePercentage}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="border-l border-border"></td>
                                        {attendanceHistory.map((status, idx) => (
                                            <td key={idx} className="text-center py-4 px-2">
                                                <div className="flex justify-center">
                                                    <div
                                                        className={`w-7 h-7 rounded flex items-center justify-center ${status === 'present' ? 'bg-green-500' :
                                                                status === 'absent' ? 'bg-red-500' : 'bg-gray-300'
                                                            }`}
                                                        title={`${status === 'present' ? 'Present' : status === 'absent' ? 'Absent' : 'Not Marked'}`}
                                                    >
                                                        {status === 'present' ? (
                                                            <CheckCircle className="w-4 h-4 text-white" />
                                                        ) : status === 'absent' ? (
                                                            <XCircle className="w-4 h-4 text-white" />
                                                        ) : (
                                                            <Minus className="w-4 h-4 text-white" />
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};
