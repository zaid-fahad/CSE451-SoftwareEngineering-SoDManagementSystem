# Agile Project Retrospective & System Architecture

This document provides a comprehensive Agile retrospective, architectural blueprint, and database entity relationship model for the Departmental **Student-on-Duty (SoD) Management System**.

---

## 1. Agile Release Roadmap

The project was executed across 4 structured sprints, culminating in the production-ready **v4.0.0** final release.

```mermaid
gantt
    title SoD Management System Agile Releases
    dateFormat  YYYY-MM-DD
    section Sprint 1: Auth
    v1.0.0 Release (Multi-Role Auth)      :done, 2026-07-01, 2026-07-10
    section Sprint 2: Parser & Grid
    v2.0.0 Release (Parser, Overrides, CRUD) :done, 2026-07-11, 2026-07-20
    section Sprint 3: Swaps & Alerts
    v3.0.0 Release (Broadcast Trade Board)   :done, 2026-07-21, 2026-07-25
    section Sprint 4: Billing & CSV
    v4.0.0 Release (Approvals & CSV Export)  :done, 2026-07-26, 2026-07-27
```

* **Sprint 1 (v1.0.0):** Established core token security and role routing boundaries.
* **Sprint 2 (v2.0.0):** Delivered the IRAS schedule regex parser, weekly interactive grid, and manager duty planner with real-time collision warnings.
* **Sprint 3 (v3.0.0):** Enabled peers to request public broadcasts or targeted trades, backed by candidate availability filters.
* **Sprint 4 (v4.0.0):** Finalized the multi-step verification pipeline and payroll report downloads.

---

## 2. System Architecture

The application is built using a decoupled **Client-Server MVC Pattern**.

```mermaid
graph LR
    subgraph Frontend ["Frontend: React TS, CSS, Vite"]
        A[Components and Pages] --> B[Custom React Hooks]
        B --> C[Axios API Client]
    end

    subgraph Backend ["Backend: FastAPI"]
        C -->|HTTP REST| D[Router Controllers]
        D --> E[Conflict and Parser Services]
        D --> F[SQLAlchemy Models]
    end

    subgraph Database ["Database Layer"]
        F -->|Async Queries| G[(SQLite File DB)]
    end
```

### Key Components
1. **FastAPI Controllers:** Routers handle payload validation, parse parameters, enforce JWT role security, and call database actions inside async sessions.
2. **Business Logic Services:**
   * **IRAS Parser:** Extracted timetables via regex normalizing strings.
   * **Collision Checker:** Queries overlap boundaries:
     $$\text{Start}_{24} < \text{End}_{\text{existing}} \quad \text{AND} \quad \text{End}_{24} > \text{Start}_{\text{existing}}$$
3. **Custom React Hooks:** Isolates HTTP requests from representation views, managing states locally and polling endpoints for push notifications.

---

## 3. Database Entity Relationship (ER) Model

The database schemas are built using SQLAlchemy, linking records to track student duty cycles.

```mermaid
erDiagram
    USERS {
        int id PK
        string department_id
        string name
        string email
        string hashed_password
        string role
    }
    SCHEDULES {
        int id PK
        int student_id FK
        string day_of_week
        string start_time
        string end_time
        string course_code
        boolean is_override
    }
    DUTIES {
        int id PK
        int assigned_student_id FK
        string title
        string date
        string start_time
        string end_time
        string notes
    }
    SWAPS {
        int id PK
        int duty_id FK
        int requester_id FK
        int target_student_id FK
        string status
        string reason
        string created_at
    }
    NOTIFICATIONS {
        int id PK
        int user_id FK
        string title
        string message
        boolean is_read
        string created_at
    }
    BILLING_CLAIMS {
        int id PK
        int student_id FK
        string month
        float hours_logged
        float hourly_rate
        float amount
        string status
        string created_at
    }

    USERS ||--o{ SCHEDULES : has
    USERS ||--o{ DUTIES : assigned
    DUTIES ||--o{ SWAPS : traded
    USERS ||--o{ SWAPS : requests
    USERS ||--o{ SWAPS : accepts
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ BILLING_CLAIMS : submits
```

---

## 4. Shift Swap Broadcast Matching Engine Flow

The broadcast matching engine automatically filters out conflicted student peers to deliver clean notifications.

```mermaid
sequenceDiagram
    autonumber
    actor A as Student A
    participant API as FastAPI Router
    participant DB as SQLite Database
    actor B as Student B
    actor C as Student C

    A->>API: POST /api/v1/swaps/request (Duty ID, Reason)
    API->>DB: Query original duty times and active students list
    DB-->>API: Return duty details
    API->>API: Filter candidate availability
    Note over API: 1. Student has no class at duty time?<br/>2. Student has no override at duty time?<br/>3. Student has no overlapping duty?
    API->>DB: Send Broadcast Notification to Student B (No conflict)
    API->>DB: Skip Student C (Has class conflict)
    DB-->>B: Notification badge count updates
    B->>API: POST /api/v1/swaps/{id}/respond?approve=true
    API->>DB: Update Duty assigned student to Student B
    API->>DB: Update Swap status to Accepted
    API->>A: Send verification notification swap accepted
```
