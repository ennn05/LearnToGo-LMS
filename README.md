# LearnToGo — Learning Management System

A full-stack Learning Management System built by a 6-person Agile team over one semester, using Scrum sprints and Jira-tracked user stories. Instructors and admins create courses, lessons, and classrooms; students enroll, complete lessons, and track progress; admins manage instructors and view reporting dashboards.

## Tech Stack

**Frontend:** React 19, Vite, React Router, Zustand (state), Axios, Recharts
**Backend:** Node.js, Express 5, JWT authentication, bcrypt
**Database:** PostgreSQL (Neon serverless), raw parameterized SQL — no ORM
**Testing:** Jest, Supertest

## Features

- **Role-based access** — student, instructor, and admin roles with route- and API-level authorization
- **Course & lesson management** — create, edit, publish, and archive courses and lessons; assign lessons to courses
- **Classroom management** — create classrooms, enroll students, assign lessons, and record grades/completion
- **Student enrollment** — browse published courses, enroll/unenroll, track completion
- **Admin tools** — manage instructor accounts, view platform-wide statistics
- **Reports & statistics** — course, lesson, and classroom breakdowns with charts (Recharts)

## Architecture

```
├── backend/            Express REST API
│   ├── controllers/    Request handlers
│   ├── models/         Parameterized SQL queries (schema.sql included)
│   ├── routes/         Route definitions + auth middleware
│   └── middleware/      JWT authentication & role authorization
├── frontend/            React SPA (Vite)
│   └── src/
│       ├── pages/       Route-level components (role-specific views)
│       ├── store/       Zustand state (auth, theme)
│       └── libs/        Axios API client
└── .env.example          Required environment variables
```

Course/lesson/classroom detail and list pages (`CourseDetails.jsx`, `courses.jsx`, etc.) are thin role-router wrappers that render the matching `Instructor*` or `Student*` page based on the logged-in user's role.

## Getting Started

### Prerequisites
- Node.js 18+
- A PostgreSQL database (the project was built against [Neon](https://neon.tech) serverless Postgres)

### Setup

1. Clone the repo and install dependencies:
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

2. Create the database schema:
   ```bash
   psql <your-connection-string> -f backend/models/schema.sql
   ```

3. Copy `.env.example` to `.env` and fill in your database credentials and secrets:
   ```bash
   cp .env.example .env
   ```

4. Run the backend (from the project root):
   ```bash
   npm run dev
   ```
   The API starts on `http://localhost:5000`.

5. Run the frontend (in a separate terminal):
   ```bash
   cd frontend
   npm run dev
   ```

### Tests

```bash
npm test
```

## My Contribution

I worked across the full stack on this project:

- **Frontend** — built the course creation/editing flow (`CreateCourse`, `EditCourse`), lesson creation flow (`CreateLessons`), and the login page.
- **Backend** — built REST endpoints for course/lesson CRUD, published-course/lesson listings, student enrollment (add/remove into classrooms), admin instructor management (list/remove instructors), and role-based classroom and user statistics endpoints (admin vs. instructor views).
- **Database** — wrote hand-crafted parameterized PostgreSQL queries directly against the schema, including multi-table joins (course ⋈ instructor ⋈ user ⋈ lesson) that return nested JSON via `json_agg`/`json_build_object`, and managed the `course_lesson` many-to-many junction table on updates.
