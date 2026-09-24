# HireFlow

Full-Stack Recruitment Management Platform connecting Candidates, Recruiters, and Administrators through an end-to-end, state-machine-driven hiring workflow with automated resume parsing and keyword skill matching.

---

## Overview

HireFlow is an enterprise-grade web application built with Python, Django REST Framework, React, and MySQL. It digitizes the complete hiring lifecycle—from initial job creation and administrative moderation to candidate application, resume extraction, structured screening, multi-round interview scheduling, and final hiring decisions.

The platform provides dedicated, role-protected portals for each user persona while enforcing business logic, database referential integrity, and permission checks strictly on the backend.

```text
Job Creation (Recruiter)
        ↓
Job Approval (Admin)
        ↓
Job Search & Discovery (Candidate)
        ↓
Application & Resume Upload (Candidate)
        ↓
Resume Text Extraction & Skill Matching (System)
        ↓
Screening & Shortlisting (Recruiter)
        ↓
Interview Scheduling & Lifecycle (Recruiter / Candidate)
        ↓
Final Selection / Rejection (Recruiter)
```

---

## Key Features

- **Role-Based Portals**: Tailored interfaces for Candidates, Recruiters, and Administrators with JWT-secured access control.
- **Strict Server-Side State Machines**: Enforces valid lifecycles for both job postings and job applications, preventing unauthorized status jumps.
- **Automated Resume Processing**: Extracts text from both PDF and DOCX documents and matches candidate competencies against job requirements.
- **Relational Integrity**: Powered by MySQL 8.4 with foreign keys, cascading rules, and unique constraints to prevent duplicate applications and bookmarks.
- **Real-Time Notification System**: Event-triggered in-app alerts for application submissions, status updates, interview schedules, and moderation actions.
- **Analytics Dashboards**: Interactive pipeline status funnels, department distribution metrics, and candidate tracking.
- **Responsive Design**: Designed and tested across viewport sizes ranging from 320px mobile devices to 1920px desktop displays.

---

## User Roles

### 1. Candidate
- **Account & Profile**: Candidate registration, JWT login, profile editing with bio, education history, degree, institution, graduation year, experience, and declared skills.
- **Resume Management**: Upload, preview, and update resumes in `.pdf` or `.docx` format with server-side validation.
- **Job Discovery**: Multi-parameter search by title, company, skills, location, employment type, experience requirements, and salary range.
- **Saved Jobs**: Bookmark interesting positions with 1-click save/unsave functionality.
- **Application Tracking**: Real-time status tracker following application progress through every stage.
- **Interview Portal**: View scheduled interview rounds, interviewers, dates, times, and direct meeting URLs.
- **Notifications**: Instant alerts on status changes and interview invitations.

### 2. Recruiter
- **Company Branding**: Manage company profile, logo, industry, company size, website, and company overview.
- **Job Management**: Create, edit, and close job postings across departments with structured compensation brackets and skill tags.
- **Applicant Dossier**: Browse applicants per job, view detailed applicant dossiers, download original resumes, and review cover letters.
- **Resume Match Breakdown**: View algorithmic match score percentage, matched skills chips, and missing skills chips.
- **Pipeline Progression**: Advance candidates strictly through valid workflow states (`UNDER_REVIEW` → `SHORTLISTED`).
- **Interview Management**: Schedule interview rounds (`TECHNICAL`, `HR`, `MANAGERIAL`, `FINAL`), assign interviewers, set video meeting links, and record evaluation notes.
- **Hiring Decisions**: Make final candidate selection or rejection decisions with automated notifications sent to candidates.
- **Pipeline Analytics**: Visual funnel charts for applicant distribution and volume trends.

### 3. Administrator
- **Platform Control Center**: High-level platform health indicators: total users, active jobs, pending approvals, total applications, and placed candidates.
- **Job Moderation Queue**: Inspect newly submitted recruiter jobs; approve (`ACTIVE`), reject with feedback, or disable postings.
- **User Directory Management**: Search and filter all registered platform users; activate or deactivate accounts.
- **Application Audit**: Platform-wide audit log of all candidate submissions across all employers.
- **System Metrics**: Overview of platform adoption, job distribution by type, and placement velocity.

---

## Recruitment Workflow

The end-to-end recruitment process follows an enforced relational sequence:

```text
1. Recruiter creates job posting (Starts in DRAFT or PENDING_APPROVAL)
2. Administrator reviews and approves posting (Becomes ACTIVE)
3. Active job appears in public listings and candidate search
4. Candidate applies with PDF/DOCX resume and optional cover letter
5. System extracts text, parses skills, and calculates algorithmic match score
6. Recruiter reviews dossier and match analysis, moves status to UNDER_REVIEW
7. Recruiter shortlists qualified candidate (Status becomes SHORTLISTED)
8. Recruiter schedules interview (Status auto-updates to INTERVIEW_SCHEDULED)
9. Candidate views interview details and meeting link in candidate portal
10. Recruiter completes interview (Status auto-updates to INTERVIEW_COMPLETED)
11. Recruiter makes final hiring decision (Status becomes SELECTED or REJECTED)
12. Real-time notifications update candidate throughout every milestone
```

---

## Job Workflow

The job posting lifecycle is governed by a server-side state machine:

```text
DRAFT ──► PENDING_APPROVAL ──► ACTIVE ──► CLOSED
                │                │
                ▼                ▼
             REJECTED         DISABLED
```

### Supported States
- `DRAFT`: Job saved as draft by recruiter; not visible publicly.
- `PENDING_APPROVAL`: Submitted by recruiter; awaiting administrator moderation.
- `ACTIVE`: Approved by administrator; live and searchable by candidates.
- `CLOSED`: Closed by recruiter when filled or expired; applications stopped.
- `REJECTED`: Rejected during moderation; recruiter can revise and resubmit.
- `DISABLED`: Deactivated by administrator for policy non-compliance.

Transitions are strictly validated server-side. Direct jumps from `ACTIVE` to `DRAFT` or approving `CLOSED` jobs to `ACTIVE` are rejected with HTTP 400 errors.

---

## Application Workflow

Candidate applications adhere to a sequential state machine:

```text
APPLIED
   ↓
UNDER_REVIEW
   ↓
SHORTLISTED
   ↓
INTERVIEW_SCHEDULED
   ↓
INTERVIEW_COMPLETED
   ↓
SELECTED
```

Alternative terminal state:
```text
REJECTED (Permitted from APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW_SCHEDULED, or INTERVIEW_COMPLETED)
```

Direct jumps (such as `APPLIED` → `SELECTED` or `SHORTLISTED` → `SELECTED` without completing an interview) are rejected by backend validation rules.

---

## Resume Match Engine

HireFlow incorporates an algorithmic resume screening module that extracts text, identifies competencies, and matches candidate experience against job requirements.

```text
Candidate Resume (.pdf / .docx)
               ↓
    File Format Validation (Extension & <= 5MB)
               ↓
    Text Extraction (pypdf / python-docx)
               ↓
    Text Normalization (Lowercasing, Tokenization)
               ↓
    Skill Detection (150+ Technology Ontology & Aliases)
               ↓
    Comparison with Job's Required Skills
               ↓
┌──────────────────────────────┬──────────────────────────────┐
│        Matched Skills        │        Missing Skills        │
└──────────────────────────────┴──────────────────────────────┘
               ↓
    Match Score Percentage Calculation
```

### Scoring Formula
The match percentage is calculated deterministically:

$$\text{Match Score} = \min\left(100, \, \text{round}\left(\frac{\text{matched\_required\_skills}}{\text{total\_required\_skills}} \times 100\right)\right)$$

### Engine Specifications
- **PDF Extraction**: Extracted page-by-page using `pypdf` with support for both file paths and in-memory streams.
- **DOCX Extraction**: Extracted paragraph-by-paragraph and table cell-by-cell using `python-docx`.
- **Skill Taxonomy**: Curated dictionary of 150+ software engineering competencies with canonical alias mapping (e.g., `js` → `JavaScript`, `postgres` → `PostgreSQL`, `k8s` → `Kubernetes`).
- **Word-Boundary Matching**: Uses regular expressions with word boundary lookaround assertions to prevent false positive substring collisions.
- **Combined Analysis**: Analyzes both uploaded resume document text and declared candidate profile skills.

### Algorithmic Disclaimer
> **Notice**: The resume match score is an algorithmic, keyword-based indicator designed to assist human review. It does not guarantee candidate suitability or make automated hiring decisions.

---

## Technology Stack

### Frontend
- **Framework**: React 19 (SPA)
- **Tooling & Bundler**: Vite 8
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios (configured with request/response interceptors for JWT token attachment and automated refresh)
- **Icons**: React Icons (`react-icons/fi`)
- **Styling**: Vanilla CSS Design System with CSS Custom Properties, flexbox, and grid layouts

### Backend
- **Language**: Python 3.12
- **Web Framework**: Django 5.1
- **API Framework**: Django REST Framework 3.17
- **Authentication**: `djangorestframework-simplejwt`
- **CORS Handling**: `django-cors-headers`
- **Filtering**: `django-filter`
- **Database Driver**: `PyMySQL` + `cryptography`

### Database
- **Engine**: MySQL 8.4 Server
- **Character Set**: `utf8mb4` with `utf8mb4_unicode_ci` collation
- **Integrity**: Enforced foreign keys, unique constraints, and check constraints

### Resume Processing
- **PDF Engine**: `pypdf`
- **DOCX Engine**: `python-docx`

---

## Architecture

HireFlow employs a decoupled client-server architecture:

```text
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                    │
│    (Public Pages, Candidate, Recruiter, Admin Views)   │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON (REST API)
                            │ Bearer JWT Authentication
┌───────────────────────────▼────────────────────────────┐
│              Django REST Framework (Backend)           │
│   ├── Token Authentication & Custom Permission Classes │
│   ├── State Machine Validators (Jobs & Applications)   │
│   ├── Resume Parsing & Skill Matching Engine           │
│   └── Event-Driven In-App Notification Dispatcher      │
└───────────────────────────┬────────────────────────────┘
                            │ PyMySQL Connector
┌───────────────────────────▼────────────────────────────┐
│                    MySQL 8.4 Database                  │
│   ├── Users, Candidate Profiles, Recruiter Profiles    │
│   ├── Jobs, Saved Jobs, Applications                   │
│   └── Interviews, Notifications                        │
└────────────────────────────────────────────────────────┘
```

---

## Project Structure

```text
HireFlow/
├── backend/
│   ├── accounts/                   # Custom User model, Candidate & Recruiter profiles, JWT auth
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── permissions.py
│   │   ├── serializers.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   ├── validators.py
│   │   └── views.py
│   ├── applications/               # Application model, lifecycle state machine, views
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── config/                     # Django project configuration
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── core/                       # Platform analytics and management commands
│   │   ├── management/
│   │   │   └── commands/
│   │   │       └── seed_demo_data.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── interviews/                 # Interview scheduling, rounds, lifecycle
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── jobs/                       # Job postings, approval queue, filtering, saved jobs
│   │   ├── filters.py
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── media/                      # Uploaded resumes and branding (directory structure)
│   │   ├── company_logos/
│   │   ├── profiles/
│   │   └── resumes/
│   ├── notifications/              # In-app notifications and unread tracking
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── services.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── resume_matching/            # PDF/DOCX parser, skill taxonomy, matching algorithm
│   │   ├── matcher.py
│   │   ├── parser.py
│   │   ├── skills_data.py
│   │   └── tests.py
│   ├── manage.py
│   ├── requirements.txt
│   ├── verify_e2e.py               # 15-stage automated end-to-end verification script
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/             # Reusable UI components (Navbar, Sidebar, Modals, Cards)
│   │   │   ├── applications/
│   │   │   ├── common/
│   │   │   ├── interviews/
│   │   │   ├── jobs/
│   │   │   └── profile/
│   │   ├── context/                # AuthContext, NotificationContext
│   │   ├── pages/                  # Route views (Public, Candidate, Recruiter, Admin)
│   │   │   ├── admin/
│   │   │   ├── candidate/
│   │   │   ├── public/
│   │   │   └── recruiter/
│   │   ├── services/               # Centralized API service modules (Axios)
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css               # Design system, variables, utility classes, responsive media
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
├── .env.example                    # Root environment configuration template
├── .gitignore                      # Git exclusion rules
└── README.md
```

---

## Prerequisites

Ensure the following runtimes and tools are installed on your development system:

- **Python**: Version 3.10, 3.11, or 3.12
- **Node.js**: Version 18.x or 20.x
- **npm**: Version 9.x or 10.x
- **MySQL Server**: Version 8.0 or 8.4
- **Git**: Version 2.x

---

## Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd HireFlow
```

### 2. Backend Setup
Navigate into the backend directory and set up a Python virtual environment:

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\activate
# Windows (Command Prompt):
venv\Scripts\activate.bat
# macOS / Linux:
source venv/bin/activate

# Install required packages
pip install -r requirements.txt
```

### 3. Frontend Setup
In a separate terminal, navigate into the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

---

## Environment Variables

Configuration settings must be supplied via a `.env` file located in the `backend/` directory.

Copy the provided template:
```bash
# In the backend directory:
cp .env.example .env
```

Configure the following variables in `backend/.env`:

```env
# Django Security
SECRET_KEY=<your-django-secret-key>
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# MySQL Database Configuration
DB_NAME=hireflow_db
DB_USER=<your-mysql-username>
DB_PASSWORD=<your-mysql-password>
DB_HOST=127.0.0.1
DB_PORT=3306

# CORS Origin Whitelist
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

> **Security Note**: Never commit your actual `.env` file or database credentials to version control. The `.env` file is excluded via `.gitignore`.

---

## Database Setup

### 1. Create MySQL Database
Using the MySQL command-line client or administration tool:

```sql
CREATE DATABASE hireflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Apply Database Migrations
Run Django migrations to create all application tables:

```bash
cd backend
python manage.py migrate
```

### 3. Seed Demo Data (Recommended)
Populate the database with realistic demo accounts, active job postings, applicants, and interview schedules:

```bash
python manage.py seed_demo_data
```

The seed script creates the following demo accounts:
- **Administrator**: `admin@hireflow.com` (Supervisor with moderation queue)
- **Recruiter 1**: `recruiter@techcorp.com` (TechCorp Innovations)
- **Recruiter 2**: `recruiter@finflow.io` (FinFlow Solutions)
- **Candidate 1**: `candidate@hireflow.com` (Full-Stack profile)
- **Candidate 2**: `candidate2@hireflow.com` (Backend profile)

*(The login pages include 1-click auto-fill demo buttons for rapid testing.)*

---

## Running the Backend

Ensure your Python virtual environment is activated, then start the development server:

```bash
cd backend
python manage.py runserver 127.0.0.1:8000
```

The Django REST API will be accessible at: `http://127.0.0.1:8000/api/`

---

## Running the Frontend

Start the Vite development server:

```bash
cd frontend
npm run dev
```

The web application will be accessible at: `http://127.0.0.1:5173/`

Vite proxies `/api` and `/media` requests directly to `http://127.0.0.1:8000`.

---

## Testing

The application has been verified through a multi-tier testing and quality assurance regimen:

```text
Django automated tests:        27 / 27 passed
End-to-end workflow:           15 / 15 stages passed
Live browser UI verification:  12 / 12 checkpoints passed
Django system check:           0 issues identified
Frontend production build:     0 errors (completed in ~280ms)
```

### Run Django Test Suite
Execute the automated unit and integration tests:

```bash
cd backend
python manage.py test
```

The test suite covers:
- **Authentication**: Candidate/recruiter signup, JWT token issuance, password validation, role assignment.
- **Job Lifecycle**: Recruiter job creation, admin approval queue, search/filtering, bookmarks, state machine restrictions.
- **Application Lifecycle**: File upload validation, duplicate application rejection, state transitions, isolation between candidates.
- **Interviews**: Scheduling validation, date constraints, status progression to completion.
- **Notifications**: Isolation between recipients, unread count accuracy, read status toggling.
- **Resume Matching**: PDF extraction, DOCX extraction, empty resume handling, skill normalization, match score calculation.

### Run Automated E2E Verification
To test the complete 15-stage workflow programmatically against the running API:

```bash
cd backend
python verify_e2e.py
```

### Run Frontend Production Build
To validate that all React modules compile cleanly without syntax or bundling errors:

```bash
cd frontend
npm run build
```

---

## Security

HireFlow implements defense-in-depth security best practices across all layers:

- **Stateless JWT Authentication**: Access tokens (with 24-hour expiration) and refresh tokens (with 7-day expiration) managed via `djangorestframework-simplejwt`.
- **Role-Based Access Control (RBAC)**: Custom permissions (`IsCandidate`, `IsRecruiter`, `IsAdminUserRole`) guard every API endpoint. Candidates cannot access recruiter/admin endpoints, and recruiters cannot access candidate/admin endpoints.
- **Object-Level Permissions**: Recruiters can only access and update applicants and jobs belonging to their own organization. Candidates can only access their own applications.
- **File Upload Validation**: Resume uploads are strictly restricted to `.pdf` and `.docx` file formats with a 5MB maximum file size limit. Uploaded files are validated at both the serializer and model layers.
- **State Machine Integrity**: Backend serializers strictly validate lifecycle transitions, rejecting invalid status skips regardless of frontend requests.
- **Environment Isolation**: All secrets, database credentials, and debug settings are loaded through environment variables and excluded from version control.

---

## Responsive Design

The frontend user interface is built with responsive CSS media queries and fluid layouts. Responsive behavior has been verified across standard device viewports:

- **320px & 375px**: Mobile devices (single-column card stacks, collapsible mobile navigation drawer, fluid typography).
- **425px**: Large mobile screens (compact metric cards, responsive action buttons).
- **768px**: Tablets (horizontal scrolling navigation menus, 2-column job cards, responsive tables).
- **1024px & 1280px**: Small laptops and desktops (sidebar navigation layout, 2-column applicant dossiers).
- **1440px & 1920px**: Large desktop displays (max-width containers, 3-column dashboard grids, analytics charts).

No desktop-only UI components or horizontal page overflows occur on mobile screens.

---

## Future Enhancements

The following features represent potential architectural additions for subsequent releases:

- **Email Notification Dispatch**: SMTP or transactional email provider integration (e.g., SendGrid, AWS SES) for status change notifications.
- **Cloud Object Storage**: S3-compatible resume and logo file storage (AWS S3, Cloudflare R2) replacing local media storage.
- **Calendar Synchronization**: Google Calendar and Outlook integrations for interview scheduling.
- **Semantic Vector Matching**: Embedding-based resume search using vector representations alongside keyword matching.
- **Containerized Deployment**: Multi-container Docker Compose configuration for production deployments.
