import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getSessionAttendance, listCourseStudents } from '@/services/api';

export interface Student {
    id: number | string;
    name: string;
    roll: string;
    status: 'present' | 'absent' | null;
}

export interface AttendedStudent extends Student {
    time: string;
}

export function useAttendance(selectedCourseId: string | null, qrActive: boolean, currentSessionId: string | null) {
    const [studentList, setStudentList] = useState<Student[]>([]);
    const [liveAttendanceList, setLiveAttendanceList] = useState<AttendedStudent[]>([]);

    // Fetch enrolled students when course is selected
    useEffect(() => {
        if (selectedCourseId) {
            fetchEnrolledStudents(selectedCourseId);
        } else {
            setStudentList([]);
        }
    }, [selectedCourseId]);

    // Poll for live attendance when QR is active
    useEffect(() => {
        if (qrActive && currentSessionId) {
            // Fetch immediately on mount
            fetchLiveAttendance(currentSessionId);

            // Then poll every 3 seconds
            const intervalId = setInterval(() => {
                fetchLiveAttendance(currentSessionId);
            }, 3000);

            return () => clearInterval(intervalId);
        } else {
            // Clear live attendance when QR is not active
            setLiveAttendanceList([]);
        }
    }, [qrActive, currentSessionId]);

    const fetchEnrolledStudents = async (courseId: string) => {
        try {
            const data = await listCourseStudents(courseId);
            const students = (data.students || []).map((s: any) => ({
                id: s.id,
                name: s.name,
                roll: s.rollNo,
                status: null as 'present' | 'absent' | null
            }));
            setStudentList(students);
        } catch (error) {
            console.error('Failed to fetch enrolled students:', error);
            toast.error('Failed to load enrolled students');
            setStudentList([]);
        }
    };

    const fetchLiveAttendance = async (sessionId: string) => {
        try {
            const data = await getSessionAttendance(sessionId);
            const attended = (data.attendees || [])
                .filter((a: any) => a.status === 'present')
                .map((a: any) => ({
                    id: a.studentId,
                    name: a.studentName,
                    roll: a.rollNo,
                    time: new Date(a.markedAt?.toDate?.() || a.markedAt).toLocaleTimeString(),
                    status: 'present' as const
                }));
            setLiveAttendanceList(attended);

            // Update studentList status based on live attendance
            setStudentList(prev => prev.map(student => ({
                ...student,
                status: attended.find((a: any) => String(a.id) === String(student.id)) ? 'present' : student.status
            })));
        } catch (error) {
            console.error('Failed to fetch live attendance:', error);
            // Don't show error toast on polling failures to avoid spam
        }
    };

    return {
        studentList,
        setStudentList,
        liveAttendanceList,
        setLiveAttendanceList
    };
}
