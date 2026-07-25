# Departmental SoD Management System - Use Cases

## UC-01 Register & Onboard
| Field | Details |
|---|---|
| Actor | Student / Faculty / Manager |
| Preconditions | User has a Department ID. |
| Primary Flow | 1) User opens registration. 2) Enters ID, Email, and Password. 3) System validates ID. 4) Account is created. |
| Alternative | A1: ID already registered -> Show login link. |
| Post Conditions | User gains access to their specific dashboard. |

## UC-02 Parse IRAS Schedule
| Field | Details |
|---|---|
| Actor | Student |
| Preconditions | Student is logged in; has copied raw IRAS text. |
| Primary Flow | 1) Student clicks "Sync Schedule". 2) Pastes text block. 3) System parses course slots. 4) Student verifies the grid. 5) Availability is saved. |
| Alternative | A1: Parser failure -> System shows "Report Format Error" and allows manual entry. |
| Post Conditions | System can now detect conflicts for this student. |

## UC-03 Assign Lab Duty
| Field | Details |
|---|---|
| Actor | Lab Manager / Dept Manager |
| Preconditions | Manager is logged in. |
| Primary Flow | 1) Manager selects "Create Slot". 2) Defines time/lab. 3) Selects a student. 4) System checks for conflicts. 5) If no conflict, duty is assigned. |
| Alternative | A1: Conflict detected -> System shows class name and asks to override or pick another student. |
| Post Conditions | Student receives notification of the new assignment. |

## UC-04 Broadcast Shift Swap
| Field | Details |
|---|---|
| Actor | Student |
| Preconditions | Student has an assigned duty they cannot attend. |
| Primary Flow | 1) Student selects "Request Swap". 2) Enters reason (optional). 3) System identifies free students. 4) Broadcast notification is sent to eligible peers. |
| Alternative | A1: No free students found -> Alert student to contact Lab Manager directly. |
| Post Conditions | Swap request is active and visible on the "Swap Board". |

## UC-05 Process Monthly Bill
| Field | Details |
|---|---|
| Actor | Student / Faculty / Dept Manager |
| Preconditions | Month has ended; tasks are marked completed. |
| Primary Flow | 1) Student reviews and submits bill. 2) Faculty verifies their specific tasks. 3) Dept Manager reviews verified bills. 4) Dept Manager clicks "Final Approval". |
| Alternative | A1: Faculty rejects a task -> Student receives notification to provide more proof. |
| Post Conditions | Bill status changes to "Approved"; export generated for payroll. |

## UC-06 Export Visual Schedule
| Field | Details |
|---|---|
| Actor | Student |
| Preconditions | Student has assigned duties. |
| Primary Flow | 1) Student goes to Dashboard. 2) Clicks "Export Schedule Image". 3) System generates PNG with duty + class grid. 4) Image downloads to device. |
| Post Conditions | Student has an offline reference of their duties. |
