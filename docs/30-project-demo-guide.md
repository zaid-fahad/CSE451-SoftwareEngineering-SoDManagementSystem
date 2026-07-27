# SoD Management System Project Demo Guide

This guide walks you through the steps to launch the application, reset the demo database state, and execute step-by-step scenarios demonstrating all roles and workflows.

---

## 1. Prerequisites & Launching the App

Open two terminal sessions to start the backend services and frontend client.

### Terminal A: Start Backend API Server
```bash
cd backend
source .venv/bin/activate
PYTHONPATH=. fastapi dev app/main.py
```
*The backend API will boot up locally at `http://127.0.0.1:8000`.*

### Terminal B: Start Frontend Client
```bash
cd frontend
npm install
npm run dev
```
*The React client will start locally at `http://localhost:5173`.*

### Database Seeding (Reset state)
To reset the database and seed it with pre-populated schedules, duty slots, trade requests, and billing claims:
```bash
cd backend
PYTHONPATH=. .venv/bin/python seed.py
```

---

## 2. Demo User Credentials (Password: `password`)

| User Name | Email | System Role | Primary Actions |
| :--- | :--- | :---: | :--- |
| **Alice Smith** | `alice@univ.edu` | **Student** | Class parser, manual overrides, notification alerts |
| **Bob Johnson** | `bob@univ.edu` | **Student** | Shift swaps response, claim submissions |
| **Dr. Sarah Connor** | `sarah@univ.edu` | **Faculty** | Supervisor verify billing claims |
| **Prof. Alan Turing** | `alan@univ.edu` | **DeptManager** | Duty scheduler, conflict audit, release payments, CSV export |

---

## 3. Step-by-Step Demo Scenarios

### Scenario 1: Academic Class Parser & Grid Overrides
1. Open `http://localhost:5173` and log in as **Alice Smith** (`alice@univ.edu` / `password`).
2. Go to **Dashboard Overview**.
3. Under **Academic Schedule Parser**, copy-paste this raw IRAS text block and click **Parse**:
   `CSE451 - MON - 09:00-11:00`
   `CSE302 - WED - 11:00-13:00`
4. The weekly grid below will populate. Monday and Wednesday slots will color red (**Disabled class hours**).
5. Double-click on Tuesday 10:00 AM to manually toggle a **Busy Override** slot (colors orange).

### Scenario 2: Duty Creation & Collision Warnings
1. Log out, then log in as the department administrator **Prof. Alan Turing** (`alan@univ.edu` / `password`).
2. Go to the **Duty Slot Manager** page.
3. Click **Create Duty Slot** and fill out the form:
   * **Title:** Software Engineering Lab Duty
   * **Day:** Monday
   * **Start Time:** 09:00 AM, **End Time:** 11:00 AM
   * **Initial Student Assignment:** Select **Alice Smith**
4. Click **Create**.
5. The system will block submission and trigger a **conflict warning banner**:
   > **CONFLICT DETECTED:** Alice Smith has a class conflict ('CSE451') on Monday 09:00 AM - 11:00 AM.
6. Change the time to Monday 01:00 PM - 03:00 PM and click submit. The duty is successfully scheduled and assigned to Alice.

### Scenario 3: Shift Trading & Inbox Notifications
1. Log out, then log in as student **Diana Prince** (`diana@univ.edu` / `password`).
2. Go to the **Shift Swap Portal** and click **Request Shift Swap**.
3. Select your assigned duty *Linear Algebra Exam Invigilation*, write "Family appointment" as the reason, and click **Broadcast**.
4. Log out, and log in as **Alice Smith** (`alice@univ.edu` / `password`).
5. Notice the **inbox bell icon** in the top navigation bar displays a red badge count `1`.
6. Click the bell to open the dropdown inbox and see the incoming trade message:
   > "Diana Prince is looking to swap their shift: 'Linear Algebra Exam Invigilation' on 2026-08-05..."
7. Click the notification, go to the **Shift Swap Portal**, view the trade card under the **Peer Trade Feed** tab, and click **Accept**.
8. The duty is instantly transferred to Alice.

### Scenario 4: Billing approval Pipeline & Payroll CSV Export
1. Log out, and log in as student **Bob Johnson** (`bob@univ.edu` / `password`).
2. Go to the **Dashboard Overview** and click **Submit Monthly Billing**.
3. Select month **August 2026**, log **24 hours**, and click submit.
4. Log out, and log in as Faculty **Dr. Sarah Connor** (`sarah@univ.edu` / `password`).
5. Go to the **Billing & Payroll** page. Locate Bob's submitted claim and click **Verify Claim** (state changes to `Faculty_Verified`).
6. Log out, and log in as Dept Manager **Prof. Alan Turing** (`alan@univ.edu` / `password`).
7. Go to **Billing & Payroll**, locate Bob's verified claim, and click **Approve Claim**.
8. In the toolbar above, click the green **Export Payroll CSV** button.
9. A CSV spreadsheet downloads compiling name, hours logged, rates, total payouts, and approval dates.
