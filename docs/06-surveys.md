# Departmental SoD Management System - Survey Report

## Survey Overview
| Attribute | Value |
|---|---|
| Sample Size | 65 respondents |
| Segments | SoD Students (80%), Faculty (15%), Lab Managers (5%) |
| Duration | 7 days |
| Method | Online structured questionnaire distributed via departmental channels. |

## Survey Questions and Results
| Q# | Question | Top Responses | Percentage |
|---|---|---|---|
| Q1 | How often do you face duty/class conflicts? | 1-2 times per month | 62% |
| Q2 | How do you negotiate shift swaps? | Messaging apps (WhatsApp/Telegram) | 88% |
| Q3 | Most annoying part of being an SoD? | Manual schedule tracking / Billing delays | 75% |
| Q4 | Would you use an automated IRAS parser? | Yes, definitely | 94% |
| Q5 | Do you find the current billing process transparent? | No | 68% |
| Q6 | How much time do you spend on shift swapping? | > 30 mins per swap | 55% |
| Q7 | Preferred notification channel for tasks? | In-app + Push notifications | 72% |
| Q8 | Importance of a visual schedule export? | High | 81% |
| Q9 | Satisfaction with current Google Sheet method? | Very Low / Low | 78% |
| Q10 | Would you trust an automated proxy engine for swaps? | Yes, if it checks my classes | 89% |

## Feature Demand Ranking
| Rank | Feature | Demand Score (/100) |
|---|---|---|
| 1 | Automated IRAS Parser | 96 |
| 2 | Intelligent Shift Swapping (Proxy Engine) | 92 |
| 3 | Real-time Billing Dashboard | 88 |
| 4 | Conflict Alert System | 85 |
| 5 | Visual Schedule Export (Image) | 79 |
| 6 | Exam Slot Management | 74 |

## Analysis
1. **Automation is Non-Negotiable:** The high demand for the IRAS parser indicates a massive pain point in manual schedule matching.
2. **Communication Fatigue:** Shift swapping via messaging apps is inefficient and creates high cognitive load.
3. **Trust Deficit:** The lack of transparency in billing is a primary motivator for a new system.
4. **Mobile Utility:** High interest in visual exports and push notifications suggests a need for mobile-optimized workflows.

## Recommendations
| Recommendation | Linked Requirement IDs |
|---|---|
| Prioritize the IRAS Parsing engine in Phase 1. | FR-Parser-01 |
| Build a robust Broadcast Proxy Engine for swaps. | FR-Proxy-01..05 |
| Implement a transparent "My Earnings" view for students. | FR-Bill-01 |
| Ensure mobile-responsive dashboard and image exports. | FR-UI-01, FR-Export-01 |
