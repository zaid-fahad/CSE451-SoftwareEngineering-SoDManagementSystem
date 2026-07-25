# Departmental SoD Management System - Product Requirements Document (PRD)

## Product Vision
To create a seamless, conflict-free operational environment for the Department of Physical Science by automating the end-to-end lifecycle of student duties, from schedule parsing to financial approval.

## Problem Statement
The current manual management of student duties leads to frequent academic schedule conflicts, inefficient shift swapping via messaging apps, and transparency issues in the monthly billing process.

## Product Goals
| Goal ID | Goal | KPI |
|---|---|---|
| PG-01 | Automate Schedule Integration | 100% of SoD students have parsed IRAS schedules. |
| PG-02 | Eliminate Scheduling Conflicts | < 1% of assigned duties overlap with class times. |
| PG-03 | Streamline Shift Swapping | Reduce swap negotiation time from hours to minutes. |
| PG-04 | Ensure Billing Transparency | Reduce billing disputes by 80%. |
| PG-05 | Visual Clarity | Provide 1-click schedule image exports for all users. |

## SMART Requirement Writing Standard
Requirements are authored to be Specific, Measurable, Achievable, Relevant, and Timely.

## MoSCoW Prioritization
| Category | Features |
|---|---|
| **Must Have** | User Auth (Roles), IRAS Parser, Task CRUD (Lab/Faculty), Basic Dashboard, Bill Submission. |
| **Should Have** | Broadcast Proxy Engine (Swaps), Multi-stage Approval Pipeline, Conflict Alerts, Schedule Export. |
| **Could Have** | Exam Slot Management Module, Advanced Analytics, Push Notifications. |
| **Won't Have** | Direct Payroll Integration, Native Mobile App (this phase). |

## Target Users
- **Students (SoD):** The primary workforce.
- **Faculty Members:** Task requestors and first-level approvers.
- **Lab Managers:** Operational supervisors.
- **Department Managers:** Financial overseers.

## Feature List
| Feature Group | Description |
|---|---|
| **Identity & Access** | Role-based login (Student, Faculty, Lab Manager, Dept Manager). |
| **Schedule Engine** | IRAS raw text parser, availability visualization, conflict detection. |
| **Task Management** | Centralized dashboard for Lab, Faculty, and Exam duties. |
| **Proxy Engine** | Shift swap broadcasting, availability-based matching, swap approval. |
| **Financial Pipeline** | Monthly bill generation, Faculty verification, Manager final approval. |
| **Utility & Export** | Image-based schedule export, CSV duty logs, activity audit. |

## Success Metrics
| Metric | Target |
|---|---|
| Parser Success Rate | >= 98% on valid raw text. |
| Average Time to Approval | < 3 days from bill submission. |
| Swap Acceptance Rate | >= 85% for broadcasted requests. |
| User CSAT (Pilot) | >= 4.2 / 5.0 |

## Release Strategy
1. **Phase 1 (MVP):** Core Auth, Parser, and Task Dashboard for Lab Duty.
2. **Phase 2:** Proxy Engine for swaps and Faculty task module.
3. **Phase 3:** Full Bill Approval Pipeline and Exam Slot Management.
4. **Phase 4:** Advanced Reporting and UI/UX polish.

## Dependencies
- Availability of raw IRAS schedule format.
- Cooperation from Faculty for the pilot approval phase.
- Departmental hosting environment for the PostgreSQL database.
