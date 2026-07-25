# Departmental SoD Management System - User Personas

## Persona P1 - Sajeeb (The Overwhelmed Student)
| Attribute | Details |
|---|---|
| Role | 3rd Year Physics Student / Lab SoD |
| Goals | Manage 12 hours of duty without missing classes; get paid on time. |
| Motivations | Financial support for studies; gaining departmental experience. |
| Pain Points | Changing class times cause duty conflicts; hates messy WhatsApp swap groups. |
| Tech Usage | Heavy mobile user; relies on screenshots of schedules. |
| Story | "I once missed a lab duty because my tutorial was rescheduled. I didn't find a replacement in time because I had to message everyone individually." |

## Persona P2 - Dr. Ariful (The Busy Faculty)
| Attribute | Details |
|---|---|
| Role | Associate Professor, Physical Science |
| Goals | Delegate research lab prep and exam invigilation to students efficiently. |
| Motivations | Focusing on research and teaching rather than admin tasks. |
| Pain Points | Forgets which student did what; finds monthly bill approval tedious. |
| Tech Usage | Laptop-focused; prefers quick email/notification-based actions. |
| Story | "I want to approve a student's bill in two clicks. I don't want to hunt through my emails to remember if they actually helped with the lab setup on the 15th." |

## Persona P3 - Mr. Kamal (The Lab Manager)
| Attribute | Details |
|---|---|
| Role | Senior Lab Manager |
| Goals | Ensure 100% coverage across 4 labs; minimize manual sheet updates. |
| Motivations | Smooth lab operations and safety compliance. |
| Pain Points | Hard to track who is currently in the lab; slow to find replacements for sick SoDs. |
| Tech Usage | Desktop browser-heavy; values clear, printable schedules. |
| Story | "When a student calls in sick, I need to broadcast a request and see who is actually free right now according to their class schedule." |

## Persona P4 - Ms. Rehana (The Dept. Manager)
| Attribute | Details |
|---|---|
| Role | Department Administrative Officer |
| Goals | Zero billing disputes; accurate financial records for the university. |
| Motivations | Financial integrity and administrative efficiency. |
| Pain Points | Constant arguments between students and faculty over hours; manual data entry. |
| Tech Usage | Spreadsheet power-user; values data exports and audit trails. |
| Story | "I need a system where every hour I approve has been verified by a faculty member. I want to click 'Export' and have the payroll file ready." |

## Persona Coverage to Feature Mapping
| Theme | Primary Persona | Linked Features |
|---|---|---|
| Conflict-Free Scheduling | P1, P3 | IRAS Parser, Conflict Alerts |
| Rapid Coordination | P1, P3 | Broadcast Proxy Engine |
| Low-Friction Verification | P2 | One-click Approval, Task Logs |
| Financial Integrity | P4 | Multi-stage Pipeline, Audit Logs, CSV Export |
