# GitHub & Git Configuration Guide

**Project:** Departmental SoD Management System  
**Team Members:**  
* **Zaid** (Backend, Database, Parser, & DevOps Lead) - `@zaid-fahad` (GitHub username)
* **Happy** (Frontend, UI/UX, & QA Specialist) - `@Momotaj-Happy` (GitHub username)

This guide provides the exact setup scripts and markdown prompts to initialize the GitHub repository, automate issue creation using the GitHub CLI, establish branching structures, enforce commit guidelines, and outline release tagging.

---

## 1. Automated GitHub Issues Creator Script

To save time, run the following bash script in your terminal from the project root. It utilizes the GitHub CLI (`gh`) to create and assign all sprint issues automatically.

### `setup_github_issues.sh`
```bash
#!/bin/bash

# Ensure GitHub CLI is installed and authenticated
if ! command -v gh &> /dev/null; then
    echo "Error: 'gh' (GitHub CLI) is not installed. Please install it and log in via 'gh auth login'."
    exit 1
fi

echo "Initializing GitHub Issues for SoD Management System..."

# Define milestones
gh api repos/:owner/:repo/milestones -f title="Sprint 1: Core Foundation & Auth" -f due_on="2026-08-10T00:00:00Z"
gh api repos/:owner/:repo/milestones -f title="Sprint 2: IRAS Parser & Dashboard" -f due_on="2026-08-24T00:00:00Z"
gh api repos/:owner/:repo/milestones -f title="Sprint 3: Shift-Swapping Proxy" -f due_on="2026-09-07T00:00:00Z"
gh api repos/:owner/:repo/milestones -f title="Sprint 4: Billing & Release" -f due_on="2026-09-21T00:00:00Z"

# Create Labels
gh label create "epic:auth" --color "5319e7" --description "Epic: Authentication and Role Management" --force
gh label create "epic:parser" --color "0052cc" --description "Epic: Schedule & Availability (IRAS Parser)" --force
gh label create "epic:tasks" --color "006b75" --description "Epic: Task & Duty Management" --force
gh label create "epic:proxy" --color "bfd4f2" --description "Epic: Proxy Engine (Shift Swapping)" --force
gh label create "epic:billing" --color "b60205" --description "Epic: Billing & Approval Pipeline" --force
gh label create "epic:utility" --color "e99695" --description "Epic: Utility & Reporting" --force
gh label create "security" --color "d93f0b" --description "Security concerns or RBAC checks" --force
gh label create "safety-critical" --color "d93f0b" --description "Database-level validation and conflict checks" --force

# Issue 1: Registration (US-001) - Sprint 1
gh issue create \
  --title "[Epic: E1] User Registration and Role Setup (US-001)" \
  --body "### Description
Implement user registration using department ID. Assign default role as 'Student' and provide manual admin override.

### Tasks
- [Backend - Zaid] Create 'users' table with fields: id, department_id, name, email, hashed_password, role.
- [Backend - Zaid] Write FastAPI registration endpoint /api/v1/auth/register. Validate department ID unique constraint.
- [Frontend - Happy] Design and build /register UI form. Handle error responses.

### Acceptance Criteria
- GIVEN a student provides their Department ID, unique email, and password.
- WHEN they submit the form.
- THEN the system registers the account and defaults the role to 'Student'." \
  --assignee "zaid-fahad,Momotaj-Happy" \
  --label "feature,epic:auth" \
  --milestone "Sprint 1: Core Foundation & Auth"

# Issue 2: Login & RBAC (US-002, US-003) - Sprint 1
gh issue create \
  --title "[Epic: E1] Secure Login API & Frontend RBAC Guard (US-002, US-003)" \
  --body "### Description
Implement secure login generating a short-lived JWT, and create frontend router guards preventing access to restricted pages.

### Tasks
- [Backend - Zaid] Configure Argon2id password hashing and /api/v1/auth/login token generation.
- [Backend - Zaid] Create dependencies to enforce roles (Student, Faculty, Manager) on API endpoints.
- [Frontend - Happy] Build /login form, store JWT in local memory, and set up frontend route guards.

### Acceptance Criteria
- GIVEN a user logs in with incorrect credentials, a 401 Unauthorized is returned.
- GIVEN a student attempts to navigate directly to /admin/billing, the system redirects to /dashboard with an access denied toast." \
  --assignee "zaid-fahad,Momotaj-Happy" \
  --label "feature,security,epic:auth" \
  --milestone "Sprint 1: Core Foundation & Auth"

# Issue 3: IRAS Schedule Parser Backend (US-004) - Sprint 2
gh issue create \
  --title "[Epic: E2] Develop IRAS Raw Text Schedule Parser (US-004)" \
  --body "### Description
Develop the core backend parsing module that processes raw text blocks from the IRAS portal, extracts days, class hours, and course codes, and populates the database availability slots.

### Tasks
- [Backend - Zaid] Design PostgreSQL schedule schema (student_id, day_of_week, start_time, end_time, course_code).
- [Backend - Zaid] Implement regex matching functions for IRAS raw text patterns.
- [Backend - Zaid] Build /api/v1/schedule/parse endpoint. Detect and handle invalid raw format.

### Acceptance Criteria
- GIVEN a student pastes valid IRAS timetable text.
- WHEN the parser executes.
- THEN the system correctly populates 'Busy' blocks and returns a success response showing the count of slots parsed." \
  --assignee "zaid-fahad" \
  --label "feature,epic:parser" \
  --milestone "Sprint 2: IRAS Parser & Dashboard"

# Issue 4: Availability Grid Interface (US-005, US-006) - Sprint 2
gh issue create \
  --title "[Epic: E2] Build Interactive Availability Grid UI (US-005, US-006)" \
  --body "### Description
Build a weekly timetable grid component in React. Display parsed IRAS schedules as non-editable 'Class' slots, and allow students to manually toggle additional 'Busy' slots.

### Tasks
- [Frontend - Happy] Create visual grid component (Monday - Saturday, hourly blocks).
- [Frontend - Happy] Connect component to /api/v1/schedule/parse and fetch endpoints to load availability.
- [Frontend - Happy] Add double-click toggle behavior allowing users to manually override blocks.

### Acceptance Criteria
- GIVEN the student opens their availability page.
- WHEN the timetable loads.
- THEN parsed class hours are colored red (disabled) and manual overrides can be toggled by the user." \
  --assignee "Momotaj-Happy" \
  --label "feature,epic:parser" \
  --milestone "Sprint 2: IRAS Parser & Dashboard"

# Issue 5: Duty Slot CRUD and Manager Dashboard (US-007) - Sprint 2
gh issue create \
  --title "[Epic: E3] Build Duty Slot Creation & Management (US-007)" \
  --body "### Description
Implement slot creation for Lab and Exam duties. Allow Managers to define duty windows, roles needed, and assign available students.

### Tasks
- [Backend - Zaid] Implement duties schema and API routes for CRUD operations.
- [Frontend - Happy] Build the manager's duty management dashboard to view all schedules.
- [Frontend - Happy] Build the duty creation modal form.

### Acceptance Criteria
- GIVEN a Lab Manager creates a slot: 'Lab Duty - Mon 9:00 AM'.
- WHEN they assign Student A.
- THEN the system verifies availability and saves the assignment, notifying the student." \
  --assignee "zaid-fahad,Momotaj-Happy" \
  --label "feature,epic:tasks" \
  --milestone "Sprint 2: IRAS Parser & Dashboard"

# Issue 6: Scheduling Conflict Detection Engine (US-010) - Sprint 2
gh issue create \
  --title "[Epic: E3] Implement Real-time Scheduling Conflict Prevention (US-010)" \
  --body "### Description
Develop the logic to check for overlaps between student schedules and assigned duty slots. Prevent managers from assigning a student if they have class.

### Tasks
- [Backend - Zaid] Write database-level validation check during assignment.
- [Backend - Zaid] Return detail payload on error containing the specific course conflict (e.g., PHY101).
- [Frontend - Happy] Show warning banners in the assignment UI when selecting conflicted students.

### Acceptance Criteria
- GIVEN a student has class on Monday 10:00 AM - 12:00 PM.
- WHEN a manager tries to assign them duty on Monday 11:00 AM.
- THEN the transaction is aborted, and a 409 Conflict error is returned." \
  --assignee "zaid-fahad,Momotaj-Happy" \
  --label "feature,safety-critical,epic:tasks" \
  --milestone "Sprint 2: IRAS Parser & Dashboard"

# Issue 7: Shift Swap Proxy Engine Backend (US-011, US-012) - Sprint 3
gh issue create \
  --title "[Epic: E4] Broadcast Shift Swap & Candidate Matching (US-011, US-012)" \
  --body "### Description
Build the backend matching engine for shift swaps. When a student requests a swap, find all other students who are free and send them the broadcast.

### Tasks
- [Backend - Zaid] Design swaps database schema containing: original_duty_id, requesting_student_id, accepting_student_id, status.
- [Backend - Zaid] Write query filtering for: has_matching_role, is_free_at_target_time, is_not_already_assigned.
- [Backend - Zaid] Create endpoint /api/v1/swaps/available to return eligible swaps for a logged-in student.

### Acceptance Criteria
- GIVEN Student A requests a swap for a duty on Tuesday 2:00 PM.
- WHEN the engine matches candidates.
- THEN only students who are free during that hour are shown the request in their backlog." \
  --assignee "zaid-fahad" \
  --label "feature,epic:proxy" \
  --milestone "Sprint 3: Shift-Swapping Proxy"

# Issue 8: Shift Swap UI Portal (US-013) - Sprint 3
gh issue create \
  --title "[Epic: E4] Implement Shift Swap Portal and Acceptance Flow (US-013)" \
  --body "### Description
Develop the user interface where students can request a shift swap and view/accept broadcasted swap requests from their peers.

### Tasks
- [Frontend - Happy] Add 'Request Swap' button to the Student Duty Dashboard.
- [Frontend - Happy] Build the Swap Feed page listing available trades.
- [Frontend - Happy] Handle acceptance confirmation modal, updating local lists on success.

### Acceptance Criteria
- GIVEN Student B views their Swap Feed.
- WHEN they click 'Accept' on Student A's request.
- THEN the duty ownership shifts to Student B, and both dashboards are immediately updated." \
  --assignee "Momotaj-Happy" \
  --label "feature,epic:proxy" \
  --milestone "Sprint 3: Shift-Swapping Proxy"

# Issue 9: Billing State-Machine & Approval Pipeline (US-014, US-015, US-016) - Sprint 4
gh issue create \
  --title "[Epic: E5] Implement Multi-Stage Bill Approval Pipeline (US-014, US-015, US-016)" \
  --body "### Description
Build the financial tracking pipeline. Students log completed duties, which are first verified by the assigned Faculty member, and then finally approved by the Department Manager.

### Tasks
- [Backend - Zaid] Implement states: Submitted, Faculty_Verified, Manager_Approved, Disputed.
- [Backend - Zaid] Write API endpoint for faculty verification and manager final approval.
- [Frontend - Happy] Build distinct dashboard panels for Faculty review and Manager financial release.

### Acceptance Criteria
- GIVEN a student submits their monthly bill.
- WHEN the Dept Manager views pending bills.
- THEN they only see bills that have already been verified by the relevant Faculty members." \
  --assignee "zaid-fahad,Momotaj-Happy" \
  --label "feature,epic:billing" \
  --milestone "Sprint 4: Billing & Release"

# Issue 10: Schedule Export and CSV Logging (US-018, US-019) - Sprint 4
gh issue create \
  --title "[Epic: E6] Export Visual Schedule Image & Monthly CSV (US-018, US-019)" \
  --body "### Description
Develop client-side visual schedule PNG image generation and backend manager CSV log exports for payroll processing.

### Tasks
- [Frontend - Happy] Integrate html2canvas to render the availability grid and duties as a downloadable PNG image.
- [Backend - Zaid] Write /api/v1/export/report/csv stream returning monthly aggregated duty hours for payroll.

### Acceptance Criteria
- GIVEN a student clicks 'Export Schedule'.
- THEN a PNG file of the exact weekly grid is downloaded.
- GIVEN a manager requests a CSV report, a file formatted with student IDs, verified hours, and total payouts is generated." \
  --assignee "zaid-fahad,Momotaj-Happy" \
  --label "feature,epic:utility" \
  --milestone "Sprint 4: Billing & Release"

echo "All 10 GitHub Issues created and assigned successfully!"
```

---

## 2. Git Repository & Branching Setup

Use the following terminal prompts to initialize the repository and create the central development branches.

### Step 1: Initialize Git and Create Default Branches
```bash
# Initialize local repository
git init -b main

# Create initial commit to anchor main
echo "# Departmental SoD Management System" > README.md
git add README.md
git commit -m "chore: initial commit on main"

# Create dev branch and switch to it
git checkout -b dev

# Push both branches to GitHub (replace URL with actual project repo URL)
git remote add origin https://github.com/zaid-fahad/CSE451-SoftwareEngineering-SoDManagementSystem.git
git push -u origin main
git push -u origin dev
```

### Step 2: Set Branch Protection Rules on GitHub (Recommended Actions)
Go to **GitHub Settings > Branches > Add branch protection rule**:
1. **Rule target pattern:** `main`
   - [x] Require a pull request before merging (Require 1 approval).
   - [x] Require status checks to pass before merging (e.g., CI testing).
2. **Rule target pattern:** `dev`
   - [x] Require a pull request before merging.
   - [x] Require status checks to pass before merging.

---

## 3. Developer Workflow Instructions

### Zaid (Backend, DB, & DevOps) - Local Branch Setup
When starting a backend task (e.g. implementing the IRAS parser):
```bash
# Ensure local dev branch is up to date
git checkout dev
git pull origin dev

# Create a scoped feature branch
git checkout -b feature/iras-regex-parser

# Develop your backend modules...
# Run pytest locally to verify code passes all backend tests
pytest backend/tests/
```

### Happy (Frontend, UI/UX, & QA) - Local Branch Setup
When starting a frontend task (e.g. building the availability grid):
```bash
# Ensure local dev branch is up to date
git checkout dev
git pull origin dev

# Create a scoped feature branch
git checkout -b feature/availability-grid-ui

# Develop your React components...
# Run linting and type-checking locally
npm run lint
npm run build
```

---

## 4. Commits & Tagging Standards

### Commit Message Format (Conventional Commits)
Both members must structure commit messages as follows: `<type>(<scope>): <short summary>` followed by `#<issue_id>` to link to the GitHub issue.

* **Types:**
  - `feat`: A new feature (e.g., `feat(parser): add regex parsing logic #3`)
  - `fix`: A bug fix (e.g., `fix(auth): fix jwt signature validation #2`)
  - `docs`: Documentation changes only (e.g., `docs(setup): update installation readme`)
  - `style`: Formatting, missing semi-colons (no production code change)
  - `refactor`: Refactoring production code without behavior changes
  - `test`: Adding missing tests, refactoring tests
  - `chore`: Updating build tasks, dependencies, package configurations

### Tagging Releases (End of Sprints)
At the end of a sprint, Zaid (as Release Manager) will tag the version release:
```bash
# Merge dev to main via Pull Request on GitHub, then tag main:
git checkout main
git pull origin main

# Tag version 1.0.0 for Sprint 1 release
git tag -a v1.0.0 -m "Release v1.0.0 - Sprint 1 core auth and schemas"

# Push tags to origin
git push origin v1.0.0
```

---

## 5. GitHub Project (Kanban) Board Setup

To track your issues on a visual Kanban Board (GitHub Projects), use the automated `setup_github_project.sh` script.

### Step 1: Refresh GitHub CLI Scopes
Because managing projects is a high-permission scope, you must refresh your GitHub CLI token:
```bash
gh auth refresh -s project
```

### Step 2: Run the Project Setup Script
Run the script to create, link, and populate the project board:
```bash
./setup_github_project.sh
```

This will automatically:
1. Create a project board titled **"SoD Management System Board"**.
2. Link the board to your `CSE451-SoftwareEngineering-SoDManagementSystem` repository.
3. Add all 10 existing issues to the project backlog.

