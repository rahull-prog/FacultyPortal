# IIITNR Attendance System - Faculty Portal

The Faculty Portal is a web-based interface for professors to manage courses, generate attendance QR codes, and view attendance analytics.

## Features
- **Dashboard**: Overview of active courses and recent sessions.
- **Course Management**: View enrolled students and session history.
- **QR Generation**: Generate dynamic, geofenced QR codes for students to scan.
- **Attendance Analytics**: View tables and grids of student attendance.
- **Manual Adjustments**: Manually mark students present/absent if needed.

## Tech Stack
- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express (separate repo)
- **Database**: Firebase Firestore

## Setup & Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/kydrahul/FacultyPortal.git
    cd FacultyPortal
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run development server:
    ```bash
    npm run dev
    ```
4.  Build for production:
    ```bash
    npm run build
    ```

## Environment Variables
Create a `.env` file in the root with your Firebase config:
```env
VITE_API_BASE_URL=https://your-backend-url.com
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```
