# Departmental SoD Management System - Entity Relationship Diagram (ERD)

## Entity Overview
| Entity | Purpose |
|---|---|
| **User** | Central identity record with role and Department ID. |
| **AcademicSchedule** | Parsed course slots for a student. |
| **DutySlot** | Recurring or one-off duty templates (e.g., "Monday Lab Duty"). |
| **TaskAssignment** | Specific instance of a duty assigned to a student on a specific date. |
| **SwapRequest** | Record of a broadcasted swap request and its resolution. |
| **MonthlyBill** | Aggregated financial record for a student for a specific month. |
| **AuditLog** | Immutable record of critical changes and approvals. |

## Mermaid ER Diagram (Relational)
```mermaid
erDiagram
    USER ||--o{ ACADEMIC_SCHEDULE : has
    USER ||--o{ TASK_ASSIGNMENT : assigned_to
    USER ||--o{ MONTHLY_BILL : owns
    USER ||--o{ AUDIT_LOG : triggers
    
    DUTY_SLOT ||--o{ TASK_ASSIGNMENT : generates
    
    TASK_ASSIGNMENT ||--o| SWAP_REQUEST : can_be_swapped
    SWAP_REQUEST ||--|| USER : requested_by
    SWAP_REQUEST }|--|| USER : accepted_by

    MONTHLY_BILL ||--o{ TASK_ASSIGNMENT : contains
    
    FACULTY_VERIFICATION }|--|| TASK_ASSIGNMENT : verifies
    FACULTY_VERIFICATION }|--|| USER : verified_by

    USER {
        uuid id PK
        string dept_id UK
        string email UK
        string password_hash
        enum role "STUDENT, FACULTY, LAB_MGR, DEPT_MGR"
        datetime created_at
    }

    ACADEMIC_SCHEDULE {
        uuid id PK
        uuid student_id FK
        string course_code
        string day_of_week
        time start_time
        time end_time
        string semester
    }

    TASK_ASSIGNMENT {
        uuid id PK
        uuid duty_slot_id FK
        uuid student_id FK
        datetime scheduled_at
        enum status "PENDING, COMPLETED, CANCELLED, SWAPPED"
        text logs
        datetime verified_at
    }

    SWAP_REQUEST {
        uuid id PK
        uuid task_assignment_id FK
        uuid requester_id FK
        uuid acceptor_id FK "Nullable"
        enum status "OPEN, CLOSED, EXPIRED"
        datetime expires_at
    }

    MONTHLY_BILL {
        uuid id PK
        uuid student_id FK
        int month
        int year
        decimal total_amount
        enum status "DRAFT, VERIFIED, APPROVED, PAID"
        datetime manager_approved_at
    }
```

## Relationship Rules
1. A **User** can have multiple **AcademicSchedule** entries (one for each class).
2. A **TaskAssignment** represents a specific day/time a student is on duty.
3. A **SwapRequest** links a task to a requester and eventually an acceptor.
4. **MonthlyBill** is the financial container for all **Completed** tasks in a billing cycle.
5. **AuditLog** (not pictured in detail) tracks all state transitions in the billing and swap processes.
