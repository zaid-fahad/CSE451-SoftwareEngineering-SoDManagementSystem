# SoD Enterprise Management System

## Academic Timetables, Duty Assignments, and Shift Swaps
### ADecoupled FastAPI + React TS Application

---

## 1. Problem Statement & Project Scope

* **Academic Scheduling Overhead:** Department administrators manually collect class times and allocate lab/exam duties for student workers, causing scheduling conflicts and administrative delays.
* **Lack of Self-Service Trading:** Student workers had no automated system to trade shifts or update busy slots, causing duty absences.
* **Manual Payroll Tracking:** Supervisors manually audit student logs, leading to errors in billing claims.
* **Our Solution:** A multi-role enterprise dashboard that automates schedule parsing, checks duty collisions in database, filters eligible swap candidates, and handles multi-stage billing approvals.

---

## 2. Decoupled MVC System Architecture

```
                 +--------------------------------------------+
                 |       React TS Frontend (Vite + CSS)       |
                 |  [Dashboard, Grids, Modals, Swaps, Bills]  |
                 +----------------------+---------------------+
                                        | Axios
                                        v HTTP REST
                 +----------------------+---------------------+
                 |       FastAPI Router Controllers           |
                 |    [Auth, Schedules, Duties, Swaps, Bills] |
                 +----------------------+---------------------+
                                        | Business Services
                                        v (Regex, Overlaps)
                 +----------------------+---------------------+
                 |      SQLAlchemy Database Models            |
                 |    [User, Schedule, Duty, Swap, Bill]      |
                 +----------------------+---------------------+
                                        | Async Query
                                        v
                 +----------------------+---------------------+
                 |         SQLite DB (sod_db.db)              |
                 +--------------------------------------------+
```

---

## 3. Agile Sprint Timeline & Roadmap

* **Sprint 1 (v1.0.0) - Core Security:** Setup JWT session authentication tokens and role dashboard routers.
* **Sprint 2 (v2.0.0) - Parser & Planner:** Implemented IRAS schedule regex parsing, interactive timetables overrides, and manager duty planners with real-time class overlap blocks.
* **Sprint 3 (v3.0.0) - Shift Swap Board:** Created public swap request broadcasts (non-conflicted student matching filters) and header inbox notifications.
* **Sprint 4 (v4.0.0) - Payroll Export:** Finalized multi-stage billing approvals (Student $\rightarrow$ Faculty $\rightarrow$ Manager) and streaming CSV payroll export downloads.

---

## 4. IRAS Parser & Weekly Availability Grid

* **Regex Parsing Engine:** Extracts courses and time blocks from raw copy-pasted IRAS academic text strings in real-time.
* **Interactive availability Grid:** Automatically maps parsed class schedules into non-editable weekly grids (Monday - Saturday).
* **Manual Overrides:** Allows students to toggle individual hourly slots to "Busy" for custom appointments.

```
       +---------------------------------------------+
       | MON | Free | Free | Class (SE) | Busy (Override) |
       +---------------------------------------------+
```

---

## 5. Duty Planner & Conflict Warning Banners

* **CRUD Scheduling Controls:** Lab Managers define duty slots (location, type, capacity, assigned supervisor).
* **Collision Check Engine:** Restricts assignments by comparing candidate class calendars and overrides.
* **Real-Time Warning Banners:** Displays warnings with exact course name and hour overlaps when conflict codes (HTTP 409) are returned:
  > **[CONFLICT DETECTED]** Student Alice has class 'CSE451' on Monday 09:00 AM - 11:00 AM.

---

## 6. Shift Swap Board & Broadcast Candidate Filters

* **Flexible Trading:** Students request private swaps targeting a peer, or broadcast public trades.
* **Broadcast Candidate Filters:** The backend matches and notifies only students free of class overlaps, overrides, or other duties during that shift.
* **Automated Reassignments:** Upon acceptance, the system swaps ownership and logs alerts to the original requester.

```
 [Student A (Busy)] -> POST Request -> API (Filters free peers) -> Inbox Alert -> [Student B (Free)]
```

---

## 7. Billing Approval Pipeline & CSV Exports

* **Multi-Stage Approvals:**
  1. **Student:** Submits monthly claim hours.
  2. **Faculty:** Verifies student logs (`Faculty_Verified`).
  3. **Manager:** Approves and releases payroll payouts (`Manager_Approved` / `Paid`).
* **Double Claim Guard:** Enforces unique constraint per student per month to block double claims.
* **CSV Export Utilities:** One-click payroll exporter downloads all approved claims formatting Name, ID, Month, Hours, and Amount into a CSV spreadsheet.

---

## 8. Git Branching & Merging Workflow

* **Base Branches:**
  * `main`: Production release state.
  * `dev`: Shared integration testing branch.
* **Topic Branches:** Developers write code on `feature/<topic>` (e.g. `feature/swap-management`) branched from `dev`.
* **Merging Protocol:**
  * Topic branches squash-merge into `dev` via PRs containing issue auto-closing keywords (`Closes #7`).
  * `dev` merges into `main` via release merges for milestone versions (`v4.0.0`).

---

## 9. SDLC Quality Gates & Compliance

* **Test-Driven Verification:** Async integration tests written under `backend/tests/` asserting router schema responses prior to PR submission.
  * **Test Status:** 15/15 tests passing successfully ($100\%$ success rate).
* **Type-Safe Frontends:** Run `npm run build` to verify Vite + TypeScript compiles without warnings or errors.
* **Agile Compliance:** All 12 project sprint issues closed. Kanban boards fully in **Done** status.
