# Departmental SoD Management System - Acceptance Criteria

## AC-01 User Authentication & Roles
- **Scenario:** Valid Registration
  - **Given** a user has a valid Department ID.
  - **When** they register with a unique email and password.
  - **Then** the system creates an account and assigns the default "Student" role unless overridden by an admin.
- **Scenario:** Role-Based Access
  - **Given** a user is logged in as a "Student".
  - **When** they attempt to access the "Dept Manager" billing overview.
  - **Then** the system returns a `403 Forbidden` error.

## AC-02 IRAS Schedule Parsing
- **Scenario:** Successful Parsing
  - **Given** a raw text block copied from the IRAS portal.
  - **When** the student pastes it into the parser.
  - **Then** the system identifies all course codes, days, and time slots accurately.
  - **And** populates the student's "Busy" windows in the database.
- **Scenario:** Invalid Format
  - **Given** a random text block that is not from IRAS.
  - **When** the parser processes it.
  - **Then** the system returns a clear error message: "Format not recognized. Please copy the raw text from the IRAS Schedule page."

## AC-03 Task Assignment & Conflicts
- **Scenario:** Conflict Detection
  - **Given** a student has a class on Monday 10:00 AM - 12:00 PM.
  - **When** a manager attempts to assign them a lab duty for Monday 11:00 AM.
  - **Then** the system shows a warning: "Conflict detected: Student has a class [PHY101] at this time."

## AC-04 Proxy Engine (Shift Swapping)
- **Scenario:** Broadcast Filtering
  - **Given** Student A initiates a swap for Tuesday 2:00 PM.
  - **When** the system broadcasts the request.
  - **Then** only students who are NOT in class and NOT already on duty at Tuesday 2:00 PM receive the notification.
- **Scenario:** Swap Completion
  - **Given** Student B accepts Student A's swap request.
  - **When** the swap is confirmed.
  - **Then** the task ownership is transferred to Student B, and the dashboard is updated for both users.

## AC-05 Bill Approval Pipeline
- **Scenario:** Multi-stage Workflow
  - **Given** a student submits their monthly bill.
  - **When** the month ends.
  - **Then** the relevant Faculty members must verify the tasks first.
  - **And** only after faculty verification does the Dept Manager see the "Approve" button for that student.
- **Scenario:** Verified Logs
  - **Given** a task marked as "Completed".
  - **When** a faculty member reviews the bill.
  - **Then** they can see the timestamp and any notes/images attached by the student during the task.

## AC-06 Schedule Export
- **Scenario:** Image Generation
  - **Given** a user is on their dashboard.
  - **When** they click "Export to Image".
  - **Then** the system generates a PNG/JPG file showing their weekly duty grid.
  - **And** the image is optimized for mobile screen dimensions.
