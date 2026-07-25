# Departmental SoD Management System - Technical Design Document (TDD)

## 1. Tech Stack Details
- **Backend:** Python 3.9+, FastAPI, Pydantic, SQLAlchemy.
- **Frontend:** React, TypeScript, Vite, Tailwind CSS.
- **Database:** PostgreSQL 13+.
- **Validation:** Pydantic models for request/response serialization.

## 2. Core Module Designs

### 2.1 IRAS Parser Engine
- **Input:** Raw multi-line string (UTF-8).
- **Mechanism:** 
  - Pre-processing: Clean whitespaces and non-printable characters.
  - Regex Extraction: `(Course Code|Day|Time Slot|Venue)`.
  - Normalization: Convert 12h/24h times and Day names to ISO/Enum format.
  - Validation: Ensure no duplicate slots in a single parse operation.

### 2.2 Proxy Swap Logic
```python
def get_available_students(task_time_start, task_time_end, day):
    # 1. Get all students
    # 2. Sub-query: exclude students with CLASS at this time (AcademicSchedule)
    # 3. Sub-query: exclude students with existing DUTY at this time (TaskAssignment)
    # 4. Return list of student_ids for broadcast
    pass
```

### 2.3 Multi-stage Bill Approval
- **Status Transitions:**
  - `DRAFT` (Student) -> `SUBMITTED`
  - `SUBMITTED` -> `VERIFIED` (Faculty)
  - `VERIFIED` -> `APPROVED` (Manager)
  - `APPROVED` -> `PAID` (Manager)
- **Integrity Rule:** A bill cannot be `APPROVED` unless 100% of its linked tasks are `VERIFIED`.

## 3. Database Optimizations
- **Indices:** 
  - `idx_schedule_student_day`: Faster availability lookups.
  - `idx_task_student_date`: Faster dashboard loads.
  - `idx_bill_status`: Faster manager oversight.
- **Constraints:** Foreign Key constraints to maintain referential integrity across Users/Tasks/Bills.

## 4. Error Handling Contract
Standardized JSON error response:
```json
{
  "code": "CONFLICT_DETECTED",
  "message": "Student has a class during this time slot.",
  "detail": {
    "course": "PHY202",
    "time": "14:00 - 16:00"
  }
}
```

## 5. Frontend Architecture
- **Hooks-based Data Fetching:** Custom `useTasks`, `useBill`, `useProfile` hooks.
- **Components:** Functional components with strict TypeScript prop definitions.
- **Routing:** React Router with `ProtectedRoutes` based on user roles.

## 6. Implementation Roadmap
1. **Sprint 1:** DB Schema + Auth + Basic Task Dashboard.
2. **Sprint 2:** IRAS Parser + Conflict Detection logic.
3. **Sprint 3:** Proxy Engine (Swap logic) + Notifications.
4. **Sprint 4:** Billing Approval Workflow + Export Utilities.
