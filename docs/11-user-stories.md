# Departmental SoD Management System - User Stories

## Epic E1 - Authentication and Role Management
| US ID | Story | Priority | Mapped FR |
|---|---|---|---|
| US-001 | As a user, I want to register with my Department ID so that I can access my personalized workspace. | High | FR-AUTH-01 |
| US-002 | As a user, I want to log in securely so that my schedule and billing data are protected. | High | FR-AUTH-02 |
| US-003 | As an administrator, I want to assign roles (Student, Faculty, Manager) so that users have appropriate access levels. | High | FR-AUTH-03 |

## Epic E2 - Schedule & Availability (IRAS Parser)
| US ID | Story | Priority | Mapped FR |
|---|---|---|---|
| US-004 | As a student, I want to paste my raw IRAS schedule so that the system knows my class times automatically. | High | FR-PARSER-01 |
| US-005 | As a student, I want to see my availability grid so that I can verify the parser worked correctly. | High | FR-PARSER-02 |
| US-006 | As a student, I want to manually override availability so that I can account for non-academic commitments. | Medium | FR-PARSER-03 |

## Epic E3 - Task & Duty Management
| US ID | Story | Priority | Mapped FR |
|---|---|---|---|
| US-007 | As a manager, I want to create duty slots (Lab, Exam) so that students can be assigned to them. | High | FR-TASK-01 |
| US-008 | As a student, I want a centralized dashboard of my duties so that I know where I need to be and when. | High | FR-TASK-02 |
| US-009 | As a faculty member, I want to assign specific tasks to students so that I get help with lab prep or research. | High | FR-TASK-03 |
| US-010 | As a user, I want conflict alerts if a duty overlaps with a class so that I can resolve it immediately. | High | FR-TASK-04 |

## Epic E4 - Proxy Engine (Shift Swapping)
| US ID | Story | Priority | Mapped FR |
|---|---|---|---|
| US-011 | As a student, I want to broadcast a swap request for a duty so that I can find a replacement when I have an emergency. | High | FR-PROXY-01 |
| US-012 | As a student, I want the system to only alert available students for my swap request so that I don't waste time. | High | FR-PROXY-02 |
| US-013 | As a student, I want to accept a broadcasted swap so that I can earn extra hours when I'm free. | High | FR-PROXY-03 |

## Epic E5 - Billing & Approval Pipeline
| US ID | Story | Priority | Mapped FR |
|---|---|---|---|
| US-014 | As a student, I want to mark tasks as completed so that they are added to my monthly bill. | High | FR-BILL-01 |
| US-015 | As a faculty member, I want to verify student tasks so that I can ensure the work was actually performed. | High | FR-BILL-02 |
| US-016 | As a dept manager, I want to give final approval to bills so that the payroll process can begin. | High | FR-BILL-03 |
| US-017 | As a student, I want to see my "Pending Earnings" so that I have transparency into my upcoming payment. | Medium | FR-BILL-04 |

## Epic E6 - Utility & Reporting
| US ID | Story | Priority | Mapped FR |
|---|---|---|---|
| US-018 | As a user, I want to export my schedule as an image so that I can set it as my phone wallpaper for quick reference. | High | FR-EXPORT-01 |
| US-019 | As a manager, I want to export monthly duty logs to CSV so that I can use them for departmental reporting. | Medium | FR-EXPORT-02 |
| US-020 | As a user, I want to see an audit log of shift swaps so that there is no confusion about who was supposed to be on duty. | Medium | FR-UTIL-01 |
