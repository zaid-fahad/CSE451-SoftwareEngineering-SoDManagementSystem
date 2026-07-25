# Departmental SoD Management System - Project Overview

## Executive Summary
The Departmental SoD (Student on Duty) Management System is a specialized web platform designed for the Department of Physical Science to automate student duty tracking, task assignments, and monthly bill processing. The system replaces manual, error-prone workflows with a centralized, intelligent orchestration engine that parses academic schedules, manages task dashboards, and streamlines financial approvals.

## Project Background
The Department of Physical Science relies on students for various operational roles, including Lab Duty, Faculty Tasks, and Exam Duty. Currently, this is managed through fragmented Google Sheets, messaging app coordination, and manual timetable comparisons. This leads to frequent scheduling conflicts, shift-swapping confusion, and disputes over monthly billing.

## Business Problem
The department faces significant operational friction due to:
1. **Manual Scheduling:** Manually checking student availability against class timetables is slow and prone to errors.
2. **Communication Gaps:** Shift swapping and task updates are lost in messaging app threads.
3. **Billing Disputes:** Lack of an audit trail for completed tasks leads to inaccurate monthly bill processing and payment delays.
4. **Information Silos:** Lab managers and faculty members lack a unified view of student assignments.

## Proposed Solution
Deliver a centralized SoD management system with:
- **IRAS Schedule Parser:** Automatically converts raw academic schedule text into student availability windows.
- **Centralized Task Dashboard:** Unified view for Lab Duty, Faculty Tasks, and Exam Duty.
- **Broadcast Proxy Engine:** Facilitates intelligent shift swapping based on real-time student availability.
- **Bill Approval Pipeline:** A structured workflow for task verification and financial approval (Faculty -> Dept Manager).
- **Schedule Export:** Generates visual schedule images for easy reference and sharing.
- **Exam Slot Management:** Specialized module for coordinating exam-time duties.
- **Tech Stack:** FastAPI (Python) backend, React (TypeScript) frontend, PostgreSQL relational database.

## Project Scope
| In Scope | Description |
|---|---|
| User Management | Role-based access for Students, Faculty, Lab Managers, and Dept Managers. |
| Availability Management | IRAS schedule parsing and manual availability overrides. |
| Task Orchestration | CRUD operations for Lab, Faculty, and Exam duties. |
| Shift Swapping | Automated proxy engine for broadcasting and accepting swap requests. |
| Billing & Approvals | Multi-stage approval pipeline for monthly student payments. |
| Reporting & Export | Dashboard KPIs and image-based schedule exports. |

## Stakeholders
| Stakeholder Group | Primary Interest |
|---|---|
| Students | Clear duty schedules, easy shift swapping, and timely payments. |
| Faculty Members | Efficient task delegation and verification of student work. |
| Lab Managers | Real-time monitoring of lab duty coverage. |
| Department Managers | Financial oversight and final approval of monthly bills. |
| Engineering/DevOps | System reliability, ease of maintenance, and data integrity. |

## Business Value
| Value Driver | Expected Outcome |
|---|---|
| Operational Efficiency | 70% reduction in time spent on manual scheduling. |
| Conflict Reduction | Near-zero scheduling conflicts with academic timetables. |
| Financial Accuracy | Elimination of billing disputes through transparent audit trails. |
| Improved Coordination | Faster response times for shift swaps and urgent task assignments. |

## Success Metrics
| Metric ID | Metric | Target (First Semester) |
|---|---|---|
| SM-01 | Schedule parsing accuracy | >= 98% |
| SM-02 | Shift swap resolution time | < 4 hours (avg) |
| SM-03 | Billing dispute rate | < 2% |
| SM-04 | User adoption (Active Students/Faculty) | >= 90% |
| SM-05 | P95 API response time | <= 500 ms |

## Assumptions
1. Students have access to their raw IRAS schedule data.
2. Faculty and managers have reliable internet access for task approvals.
3. The system will initially serve the Department of Physical Science as a pilot.

## Constraints
| Constraint | Impact |
|---|---|
| Academic Calendar | Major releases must align with semester starts. |
| Privacy Regulations | Student data and financial records must be handled securely. |
| Integration | Limited initial integration with existing university systems. |

## Out Of Scope
1. Direct integration with University Payroll (manual export provided).
2. Native mobile applications (optimized mobile-web first).
3. Management of non-student staff duties.
