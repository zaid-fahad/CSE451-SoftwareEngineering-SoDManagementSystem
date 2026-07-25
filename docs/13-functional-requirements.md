# Departmental SoD Management System - Functional Requirements

| FR ID | Description | Priority | Justification |
|---|---|---|---|
| **Auth & Security** | | | |
| FR-AUTH-01 | System shall allow registration using Department ID, Email, and Password. | High | Secure onboarding. |
| FR-AUTH-02 | System shall support Role-Based Access Control (Student, Faculty, Manager). | High | Data segregation. |
| FR-AUTH-03 | System shall use JWT tokens for secure session management. | High | Stateless security. |
| **Schedule Engine** | | | |
| FR-PARSER-01 | System shall parse raw text from IRAS into structured academic schedules. | High | Automation of availability. |
| FR-PARSER-02 | System shall visualize the parsed schedule in a weekly grid. | High | User verification. |
| FR-PARSER-03 | System shall allow students to manually mark "Unavailable" slots. | Medium | Flexibility. |
| **Task Management** | | | |
| FR-TASK-01 | System shall provide a CRUD interface for creating duty slots (Lab, Exam, Faculty). | High | Core operations. |
| FR-TASK-02 | System shall display a personalized dashboard for all user roles. | High | Visibility. |
| FR-TASK-03 | System shall detect and alert on overlaps between duties and academic classes. | High | Conflict prevention. |
| FR-TASK-04 | System shall allow attaching logs or images to completed tasks. | Medium | Verification trail. |
| **Proxy Engine** | | | |
| FR-PROXY-01 | System shall allow students to initiate shift swap requests for their duties. | High | Flexibility. |
| FR-PROXY-02 | System shall identify available students for a swap based on their class schedules. | High | Intelligent matching. |
| FR-PROXY-03 | System shall broadcast swap requests via in-app notifications. | High | Coordination speed. |
| FR-PROXY-04 | System shall record the history of all shift swaps for audit purposes. | Medium | Accountability. |
| **Financial/Billing** | | | |
| FR-BILL-01 | System shall aggregate completed tasks into a monthly bill for each student. | High | Payment automation. |
| FR-BILL-02 | System shall implement a 2-stage approval (Faculty Verification -> Manager Approval). | High | Financial control. |
| FR-BILL-03 | System shall display real-time earnings estimates to students. | Medium | Transparency. |
| FR-BILL-04 | System shall support status tracking for bills (Draft, Verified, Approved, Paid). | Medium | Workflow visibility. |
| **Reporting & Utility** | | | |
| FR-EXPORT-01 | System shall export the weekly schedule as a mobile-optimized image. | High | Mobile reference. |
| FR-EXPORT-02 | System shall export monthly duty reports in CSV format. | Medium | Accounting needs. |
| FR-UTIL-01 | System shall maintain an audit trail for all duty assignments and changes. | Medium | Data integrity. |

## SMART Quality Check
- **Specific:** Every requirement targets a specific feature (Parser, Proxy, Bill).
- **Measurable:** Success can be tested via the Acceptance Criteria (AC-XX).
- **Achievable:** The tech stack (FastAPI/React/Postgres) supports these requirements.
- **Relevant:** All FRs link directly to the problems identified in the Problem Statement.
- **Timely:** Requirements are phased for a single semester delivery.
