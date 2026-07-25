# Departmental SoD Management System - Problem Statement

## Problem Context
The Department of Physical Science manages a complex ecosystem of student duties across various operational domains. Three primary roles are impacted by the current manual workflows:

| Segment | Typical Context | Core Frictions |
|---|---|---|
| Students | Lab duty, faculty assistance, exam support | Timetable conflicts, difficulty in shift swapping, delayed payments. |
| Faculty & Lab Managers | Task delegation, duty monitoring | Manual schedule tracking, difficulty finding replacements, verification overhead. |
| Department Managers | Monthly billing, financial oversight | Inconsistent duty logs, billing disputes, lack of transparent audit trails. |

## Current State (As-Is)
1. **Fragmented Tracking:** Duties are tracked in disconnected Google Sheets that require manual updates.
2. **Manual Conflict Checking:** Students must manually compare their IRAS schedules with assigned duty slots.
3. **Informal Swapping:** Shift swaps are negotiated in messaging apps, often leading to missed duties or unrecorded changes.
4. **Opaque Billing:** Monthly bills are prepared manually, leading to disputes between students and department management.

```mermaid
flowchart LR
  A[Manual IRAS Schedule] --> B[Manual Google Sheet Entry]
  B --> C[Unseen Schedule Conflicts]
  C --> D[Missed Duties / Billing Disputes]
  D --> E[Operational Friction & Stress]
```

## Future State (To-Be)
1. **Automated Parsing:** IRAS schedules are parsed automatically to establish "no-fly" zones for duty assignments.
2. **Centralized Dashboard:** A single source of truth for all duty types (Lab, Faculty, Exam).
3. **Smart Proxy Engine:** Shift swaps are managed through a broadcast engine that filters for student availability.
4. **Digital Approval Pipeline:** Multi-stage workflow (Faculty -> Manager) ensures accurate and timely billing.

```mermaid
flowchart LR
  A[IRAS Parser & Task Dashboard] --> B[Conflict-Free Scheduling]
  B --> C[Efficient Shift Swapping]
  C --> D[Transparent Bill Approvals]
  D --> E[Seamless Departmental Operations]
```

## Business Impact
| Impact Area | Current Cost | Expected Benefit |
|---|---|---|
| Administrative Time | High hours spent on manual scheduling and billing. | 70% reduction in scheduling/billing overhead. |
| Duty Coverage | Frequent gaps due to forgotten shifts or conflicts. | Near-100% duty coverage through reliable reminders. |
| Payment Speed | Weeks of delay due to billing disputes. | Faster, dispute-free monthly payment cycles. |
| User Satisfaction | Frustration with manual and opaque processes. | High trust and clarity for students and faculty. |

## Problem Statement
The Department of Physical Science lacks a unified system to manage student duties, leading to academic timetable conflicts, inefficient shift swapping, and frequent billing disputes. The Departmental SoD Management System addresses these challenges by automating schedule parsing, centralizing task management, and providing a transparent, multi-stage bill approval pipeline.
