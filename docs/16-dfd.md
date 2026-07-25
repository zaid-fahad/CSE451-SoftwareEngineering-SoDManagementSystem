# Departmental SoD Management System - Data Flow Diagrams (DFD)

## Context Diagram
```mermaid
flowchart LR
  U[User: Student/Faculty/Manager] -->|IRAS Schedule, Task Logs, Swap Requests| S[SoD Management System]
  S -->|Task Views, Conflict Alerts, Bills, Schedule Images| U
  S -->|Query/Store Data| DB[(PostgreSQL)]
  IRAS[IRAS Portal] -.->|Raw Schedule Text| U
  S -->|Payroll Data| PM[Dept Payroll Admin]
```

## Level 0 DFD
```mermaid
flowchart TD
  U[User]
  P1[1.0 User & Role Management]
  P2[2.0 Schedule Parsing & Availability]
  P3[3.0 Task & Duty Orchestration]
  P4[4.0 Proxy Swap Engine]
  P5[5.0 Billing & Approval Pipeline]
  
  D1[(D1 Users & Roles)]
  D2[(D2 Academic Schedules)]
  D3[(D3 Duties & Tasks)]
  D4[(D4 Swap Requests)]
  D5[(D5 Monthly Bills & Audit)]

  U -->|Auth| P1
  U -->|Raw Text| P2
  U -->|Task Details| P3
  U -->|Swap Req| P4
  U -->|Bill Submission| P5

  P1 <--> D1
  P2 <--> D2
  P3 <--> D3
  P4 <--> D4
  P5 <--> D5

  P2 -->|Availability| P3
  P3 -->|Conflicts| U
  P4 -->|Filtered Notifications| U
  P5 -->|Approval Workflow| U
```

## Level 1 DFD - Process Decomposition
```mermaid
flowchart TD
  subgraph SP[2.0 Schedule Parsing]
    P21[2.1 Regex Text Parser]
    P22[2.2 Availability Grid Generator]
    P23[2.3 Conflict Detector]
  end

  subgraph TO[3.0 Task Orchestration]
    P31[3.1 Task CRUD]
    P32[3.2 Role-based Dashboard]
    P33[3.3 Verification Logging]
  end

  subgraph PSE[4.0 Proxy Swap Engine]
    P41[4.1 Broadcast Request]
    P42[4.2 Availability Filter]
    P43[4.3 Ownership Transfer]
  end

  subgraph BAP[5.0 Billing Approval Pipeline]
    P51[5.1 Bill Aggregator]
    P52[5.2 Faculty Verification]
    P53[5.3 Final Manager Approval]
    P54[5.4 CSV/Export Generator]
  end

  DB[(PostgreSQL)]

  P21 -->|Parsed Slots| P22
  P22 --> DB
  P23 --> DB
  P31 --> DB
  P41 --> P42
  P42 -->|Targets| U
  P43 --> DB
  P51 --> DB
  P52 --> DB
  P53 --> DB
```
