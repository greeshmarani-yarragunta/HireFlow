# HireFlow

HireFlow is a full-stack recruitment management platform connecting Candidates, Recruiters, and Administrators through an end-to-end hiring workflow. The application streamlines the hiring process by integrating role-based access, automated resume parsing, algorithmic skill matching, interview scheduling, and real-time status tracking into a single cohesive system. Built with Django REST Framework, React, and MySQL, it enforces strict relational state machines and server-side authorization across all user workflows.

---

## Features

- **Role-Based Authentication & Access Control**: Secure JWT-based authentication with distinct permission scopes for Candidates, Recruiters, and Administrators.
- **Candidate Job Search & Applications**: Multi-criteria search and filtering by title, location, employment type, and required skills, paired with one-click applications.
- **Recruiter Job & Applicant Management**: Manage job postings, review applicant dossiers, download resumes, and manage applicant pipeline progression.
- **Admin Job Moderation & User Management**: Quality control queue to approve or reject job postings, along with platform-wide user account management.
- **Resume PDF/DOCX Parsing**: Automated text extraction from uploaded `.pdf` and `.docx` resume documents.
- **Resume Skill Matching**: Algorithmic comparison between candidate competencies and job requirements with percentage indicators.
- **Interview Scheduling**: Schedule multi-round interviews (Technical, HR, Managerial) with meeting links and candidate notifications.
- **Application Status Workflow**: Server-enforced state transitions (`Applied` → `Under Review` → `Shortlisted` → `Interview Scheduled` → `Interview Completed` → `Selected`/`Rejected`).
- **In-App Notifications**: Real-time alerts for application milestones, moderation actions, and interview schedules.
- **Responsive UI**: Clean, responsive interface optimized across mobile, tablet, and desktop viewports.
- **Analytics & Dashboards**: Dedicated metrics and pipeline summaries for candidates, recruiters, and platform administrators.

---

## User Roles

### Candidate
- **Profile**: Manage personal contact details, education history, and declared technical skills.
- **Resume**: Upload, update, and validate primary resumes in PDF or DOCX format.
- **Job Search**: Explore approved job postings with keyword, location, and role filters.
- **Applications**: Track submission progress across each stage of the hiring pipeline.
- **Saved Jobs**: Bookmark opportunities for quick access and later application.
- **Interviews**: Access scheduled interview dates, times, interviewer details, and meeting URLs.
- **Notifications**: Receive instant alerts when application statuses change or interviews are scheduled.

### Recruiter
- **Company & Profile Management**: Maintain company profile, branding, website, and industry information.
- **Job Posting**: Create, edit, and manage job openings across departments with skill requirements.
- **Applicant Management**: Inspect incoming candidate submissions, cover letters, and parsed credentials.
- **Resume Matching**: View calculated match scores alongside matched and missing skill breakdowns.
- **Interview Scheduling**: Book structured interview rounds with candidates and record evaluation notes.
- **Hiring Decisions**: Advance applicants through valid stages to make final selection or rejection decisions.
- **Analytics**: Monitor recruitment metrics, applicant volume, and pipeline status distributions.

### Administrator
- **Platform Dashboard**: High-level platform health metrics including active openings, candidates, and applications.
- **Job Moderation**: Review pending recruiter job postings to approve, reject, or request changes before publication.
- **User Management**: Oversee candidate and recruiter accounts with the ability to toggle active status.
- **Application Oversight**: Audit candidate application records across all organizations.
- **Platform Statistics**: Public and administrative insight into aggregate platform activity and adoption.

---

## Recruitment Workflow

```text
Recruiter creates job
        ↓
Admin approves job
        ↓
Candidate discovers job
        ↓
Candidate applies with resume
        ↓
Resume text extraction & skill matching
        ↓
Recruiter reviews candidate dossier
        ↓
Candidate shortlisted
        ↓
Interview scheduled & conducted
        ↓
Final selection or rejection
```

---

## Resume Matching

The platform features an automated resume skill-matching engine:

- **PDF/DOCX Text Extraction**: Extracts raw text from uploaded `.pdf` (using `pypdf`) and `.docx` (using `python-docx`) files.
- **Skill Detection**: Identifies technical skills, tools, frameworks, and competencies within parsed resume content.
- **Required-Skill Comparison**: Cross-references identified candidate competencies against the job's mandatory skills.
- **Match Percentage**: Computes an algorithmic match score indicating alignment between the candidate's background and job requirements.
- **Keyword-Based Algorithmic Indicator**: Surfaces matched skills and highlighted gaps to provide recruiters with rapid context during screening.

> **Note**: The resume match score is an algorithmic indicator designed solely to assist recruiters during screening. It does not replace human review or make automated hiring decisions.

---

## Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React | Component-based interactive user interface |
| | Vite | Fast frontend build tool and development server |
| | React Router | Client-side routing and protected route management |
| | Axios | HTTP client for REST API communication |
| | CSS | Responsive styling and custom design system |
| **Backend** | Python | Primary backend programming language |
| | Django | High-level web framework and ORM |
| | Django REST Framework | RESTful API design, serialization, and viewsets |
| | SimpleJWT | Stateless JSON Web Token authentication |
| **Database** | MySQL | Relational data persistence, foreign keys, and constraints |
| **Resume Processing** | pypdf | PDF document text extraction |
| | python-docx | DOCX document text extraction |
| **Other** | Git & GitHub | Version control and source code repository |
| | Render | Cloud application hosting platform |
| | Aiven MySQL | Managed cloud database hosting |

---

## Architecture

```text
React Frontend
        ↓
Django REST API
        ↓
MySQL
```

Authentication is managed via stateless **JSON Web Tokens (JWT)**. Clients receive an access token and a refresh token upon login. The access token is attached to subsequent requests via the `Authorization: Bearer <token>` header, verified by Django REST Framework permission classes to enforce role-based access control across all endpoints.

---

## Project Structure

```text
HireFlow/
├── backend/            # Django REST API and business logic
├── frontend/           # React single-page application (Vite)
├── .gitignore          # Git exclusion rules
├── README.md           # Project documentation
└── .env.example        # Environment variable template
```

---

## Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- MySQL Server

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
# source venv/bin/activate

pip install -r requirements.txt

# Configure environment variables in backend/.env (refer to .env.example)

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 127.0.0.1:8000
```

The Django REST API will be accessible at `http://127.0.0.1:8000/api/`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The web application will be accessible at `http://localhost:5173/`.
