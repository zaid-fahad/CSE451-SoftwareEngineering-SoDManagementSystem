# Departmental SoD Management System - Database Design

## 1. Database Overview
- **Engine:** PostgreSQL.
- **Type:** Relational.
- **Naming Convention:** `snake_case` for tables and columns.
- **Primary Keys:** `UUID` (v4) for all tables to prevent ID enumeration.

## 2. Table Definitions

### 2.1 Users Table (`users`)
| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `dept_id` | VARCHAR(50) | UNIQUE, NOT NULL |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL |
| `password_hash` | TEXT | NOT NULL |
| `full_name` | VARCHAR(255) | NOT NULL |
| `role` | ENUM | (STUDENT, FACULTY, LAB_MGR, DEPT_MGR) |
| `created_at` | TIMESTAMP | DEFAULT NOW() |

### 2.2 Academic Schedules (`academic_schedules`)
| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `student_id` | UUID | FK -> users.id |
| `course_code` | VARCHAR(20) | NOT NULL |
| `day_of_week` | ENUM | (MON, TUE, WED, THU, FRI, SAT, SUN) |
| `start_time` | TIME | NOT NULL |
| `end_time` | TIME | NOT NULL |
| `semester` | VARCHAR(20) | NOT NULL |

### 2.3 Duty Slots (`duty_slots`)
*Template for recurring tasks.*
| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `title` | VARCHAR(255) | NOT NULL |
| `type` | ENUM | (LAB, EXAM, FACULTY) |
| `day_of_week` | ENUM | |
| `start_time` | TIME | |
| `end_time` | TIME | |

### 2.4 Task Assignments (`task_assignments`)
*The actual instances of duties.*
| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `slot_id` | UUID | FK -> duty_slots.id |
| `student_id` | UUID | FK -> users.id |
| `scheduled_at` | TIMESTAMP | NOT NULL |
| `status` | ENUM | (PENDING, COMPLETED, SWAPPED, CANCELLED) |
| `log_notes` | TEXT | |
| `verified_by` | UUID | FK -> users.id |
| `bill_id` | UUID | FK -> monthly_bills.id |

### 2.5 Monthly Bills (`monthly_bills`)
| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `student_id` | UUID | FK -> users.id |
| `month` | INT | |
| `year` | INT | |
| `total_hours` | DECIMAL | |
| `status` | ENUM | (DRAFT, SUBMITTED, VERIFIED, APPROVED, PAID) |

## 3. Constraints & Triggers
- **Unique Constraint:** `student_id`, `month`, `year` on `monthly_bills` (one bill per student per month).
- **Check Constraint:** `end_time > start_time` on all time-based tables.
- **Audit Trigger:** Automatic population of `updated_at` on any record change.

## 4. Indexing Strategy
- `CREATE INDEX idx_user_role ON users(role);`
- `CREATE INDEX idx_task_date ON task_assignments(scheduled_at);`
- `CREATE INDEX idx_sched_student ON academic_schedules(student_id);`

## 5. Relational Integrity Rules
- On User Deletion: Restricted if linked to Bills or Tasks.
- On Slot Update: Does not affect existing `task_assignments` (snapshot behavior).
