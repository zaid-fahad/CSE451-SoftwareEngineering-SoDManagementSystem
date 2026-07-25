# Departmental SoD Management System - Interview Report

## Interview Framework
- Format: Semi-structured, 30-40 minutes per participant.
- Focus: Duty scheduling frictions, schedule parsing needs, shift swapping workflows, and billing transparency.
- Artifact linkage: Findings mapped to functional requirement IDs (FR-XX).

## Persona 1 - Student (SoD)
### Background
Final-year Physics student working 10 hours/week on lab duty and faculty tasks.

### Questions, Answers, Pain Points, Requirements, Insights
| Question | Interviewee Answer | Pain Point | Requirement Extracted | Insight |
|---|---|---|---|---|
| How do you check for duty conflicts? | I manually look at my printed IRAS schedule and the Google Sheet. | Time-consuming and error-prone. | FR-Parser, FR-ConflictCheck | Automation is the #1 student priority. |
| What's hard about swapping shifts? | I have to message 20 people to find one who is free. | High communication overhead. | FR-ProxyEngine, FR-Availability | Availability filtering is essential. |
| Do you trust the monthly bill? | Not really, I often have to argue about missed hours. | Lack of transparency. | FR-BillTracking, FR-AuditLog | Students need a real-time "Earnings" view. |

## Persona 2 - Lab Manager
### Background
Manager overseeing 5 labs and 15 students on rotating shifts.

| Question | Interviewee Answer | Pain Point | Requirement Extracted | Insight |
|---|---|---|---|---|
| How do you know if a lab is covered? | I have to physically check or look at the shared sheet. | Lack of real-time visibility. | FR-Dashboard, FR-RealTime | A live "Who is on duty" view is needed. |
| What happens when someone is sick? | Chaos. We struggle to find a replacement quickly. | Slow emergency coverage. | FR-BroadcastAlert | Urgent broadcast features are high ROI. |
| How do you verify hours? | I trust the students' logs, which isn't ideal. | Potential for billing errors. | FR-Verification, FR-CheckIn | Verified check-ins improve accuracy. |

## Persona 3 - Faculty Member
### Background
Professor requesting student help for research tasks and exam invigilation.

| Question | Interviewee Answer | Pain Point | Requirement Extracted | Insight |
|---|---|---|---|---|
| How do you assign tasks? | Email or WhatsApp, then I forget to track it. | Task leakage and tracking loss. | FR-TaskAssignment | Simple task CRUD for faculty. |
| Is it easy to approve bills? | No, I don't remember what was done 3 weeks ago. | Recall issues during approval. | FR-ApprovalWorkflow | Attachments/Logs at the time of task completion. |

## Persona 4 - Department Manager
### Background
Senior administrator managing the department budget and student payments.

| Question | Interviewee Answer | Pain Point | Requirement Extracted | Insight |
|---|---|---|---|---|
| What causes billing delays? | Disputes over hours and lack of faculty verification. | Financial reconciliation friction. | FR-MultiStageApproval | Faculty MUST approve before Manager sees it. |
| What reporting do you need? | Total hours per student and per duty type. | Manual data aggregation. | FR-Reporting, FR-Export | CSV/PDF exports for accounting. |

## Consolidated Pain Points
1. Manual schedule conflict detection.
2. Inefficient and noisy shift swapping.
3. Lack of real-time duty visibility for managers.
4. Opaque and dispute-prone billing process.

## Requirements Extracted (Top Priority)
FR-Parser, FR-ProxyEngine, FR-TaskDashboard, FR-ApprovalPipeline, FR-ConflictAlert, FR-ScheduleExport.

## Interview Insight Summary
The "human element" of shift swapping and bill approvals is where the current system fails. Technology must act as a bridge—automating the schedule matching and formalizing the approval workflow.
