# Departmental SoD Management System - System Requirements Specification (SRS)

## 1. Introduction
### 1.1 Purpose
This SRS document provides a comprehensive description of the Departmental SoD Management System. It outlines the functional, non-functional, and interface requirements for the system designed for the Department of Physical Science.

### 1.2 Scope
The system will manage student duty assignments, academic schedule parsing, shift swapping, and the monthly billing approval pipeline.

## 2. Overall Description
### 2.1 Product Perspective
This is a standalone web application designed to replace manual Google Sheets and messaging-based coordination within a university department.

### 2.2 Product Functions
- Automated IRAS schedule parsing.
- Centralized task and duty dashboard.
- Intelligent shift-swapping (Proxy Engine).
- Multi-stage billing approval workflow.
- Mobile-optimized schedule image export.

### 2.3 User Classes and Characteristics
- **Students:** Entry-level users; primary workers.
- **Faculty:** Middle-level users; task requestors and verifiers.
- **Lab Managers:** Operational supervisors.
- **Dept Managers:** High-level users; financial approvers.

## 3. System Requirements
### 3.1 Functional Requirements
*Reference: [13-functional-requirements.md](13-functional-requirements.md)*
- **FR-AUTH:** Authentication and Role Management.
- **FR-PARSER:** Regex-based IRAS schedule parsing.
- **FR-TASK:** Task CRUD and Dashboard.
- **FR-PROXY:** Broadcast-based swap engine.
- **FR-BILL:** Financial approval workflow.

### 3.2 External Interface Requirements
- **User Interface:** React-based SPA; responsive for mobile-web.
- **Hardware Interfaces:** Standard web server; PostgreSQL database server.
- **Software Interfaces:** FastAPI framework; Python 3.9+ environment.

### 3.3 Non-Functional Requirements
*Reference: [14-non-functional-requirements.md](14-non-functional-requirements.md)*
- **Performance:** P95 < 500ms.
- **Security:** JWT Auth, Argon2 hashing, TLS 1.2.
- **Reliability:** 99.5% uptime.
- **Maintainability:** 80% test coverage.

## 4. System Architecture
The system uses a 3-tier architecture:
1. **Frontend:** React + TypeScript (Vite).
2. **Backend:** FastAPI (Python) + SQLAlchemy ORM.
3. **Database:** PostgreSQL.

## 5. Traceability Matrix Snapshot
| Requirement ID | Design Module | Test Case ID |
|---|---|---|
| FR-PARSER-01 | Parser Engine | TC-PARS-01 |
| FR-PROXY-01 | Proxy Manager | TC-PROX-01 |
| FR-BILL-02 | Approval Workflow | TC-BILL-01 |

## 6. Appendix
- [ERD - Database Model](18-erd.md)
- [API Specification](22-api-design.md)
