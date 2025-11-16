import { getIdToken } from './firebase';

// Use environment variable for API base URL
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

async function request(path: string, options: RequestInit = {}) {
  const token = await getIdToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch(e) { data = text; }

  if (!res.ok) {
    const err = new Error(data?.error || res.statusText || 'Request failed');
    (err as any).status = res.status;
    (err as any).body = data;
    throw err;
  }

  return data;
}

export async function createFacultyProfile(payload: any) {
  return request('/api/faculty/profile', { method: 'POST', body: JSON.stringify(payload) });
}

export async function createCourse(payload: any) {
  return request('/api/faculty/courses', { method: 'POST', body: JSON.stringify(payload) });
}

export async function listCourses() {
  return request('/api/faculty/courses', { method: 'GET' });
}

export async function deleteCourse(courseId: string) {
  return request(`/api/faculty/courses/${courseId}`, { method: 'DELETE' });
}

export async function createFullClass(payload: any) {
  return request('/api/faculty/classes/full', { method: 'POST', body: JSON.stringify(payload) });
}

export async function generateQr(payload: any) {
  return request('/api/faculty/generate-qr', { method: 'POST', body: JSON.stringify(payload) });
}

export async function getSessionAttendance(sessionId: string) {
  return request(`/api/faculty/session/${sessionId}/attendance`, { method: 'GET' });
}

export async function stopSession(sessionId: string) {
  return request(`/api/faculty/session/${sessionId}/stop`, { method: 'POST' });
}

export async function listCourseStudents(courseId: string, sessionId?: string) {
  const q = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
  return request(`/api/faculty/course/${courseId}/students${q}`, { method: 'GET' });
}

export async function saveManualAttendance(sessionId: string, presentStudentIds: string[]) {
  return request(`/api/faculty/session/${sessionId}/manual-attendance`, { 
    method: 'POST', 
    body: JSON.stringify({ presentStudentIds })
  });
}
