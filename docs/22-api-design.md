# Departmental SoD Management System - API Design

## API Standards
- **Base URL:** `/api/v1`
- **Format:** JSON
- **Authentication:** Bearer JWT
- **Timezone:** UTC (ISO-8601)

## 1. Authentication & Users
| Endpoint | Method | Description | Role |
|---|---|---|---|
| `/auth/register` | POST | Create a new user account | Public |
| `/auth/login` | POST | Login and receive JWT | Public |
| `/users/me` | GET | Get current user profile | All |
| `/admin/roles` | PATCH | Update a user's role | Admin/Manager |

## 2. Schedule Parsing (IRAS)
| Endpoint | Method | Description | Role |
|---|---|---|---|
| `/schedule/parse` | POST | Parse raw IRAS text and save | Student |
| `/schedule/me` | GET | Get current academic schedule | Student |
| `/schedule/student/{id}` | GET | View a student's availability | Manager |

## 3. Tasks & Duties
| Endpoint | Method | Description | Role |
|---|---|---|---|
| `/tasks` | GET | List tasks (with filters: date, status) | All |
| `/tasks` | POST | Create a new duty assignment | Manager |
| `/tasks/{id}` | PATCH | Update task (status, logs) | Student/MGR |
| `/tasks/{id}/verify` | POST | Verify a completed task | Faculty |

## 4. Proxy Engine (Swaps)
| Endpoint | Method | Description | Role |
|---|---|---|---|
| `/swaps` | POST | Create a swap request | Student |
| `/swaps/available` | GET | List swaps I am eligible for | Student |
| `/swaps/{id}/accept` | POST | Accept a swap request | Student |

## 5. Billing & Approvals
| Endpoint | Method | Description | Role |
|---|---|---|---|
| `/bills/my-current` | GET | See current month's pending earnings | Student |
| `/bills/submit` | POST | Submit monthly bill for approval | Student |
| `/bills/pending` | GET | List bills awaiting my verification | Faculty |
| `/bills/{id}/approve` | POST | Final financial approval | Dept Manager |

## 6. Utilities
| Endpoint | Method | Description | Role |
|---|---|---|---|
| `/export/schedule/image`| GET | Generate visual schedule PNG | Student |
| `/export/report/csv` | GET | Download monthly payroll report | Manager |

## Sample Request: POST `/schedule/parse`
**Body:**
```json
{
  "raw_text": "PHY101 - MON - 09:00-11:00\nPHY202 - WED - 14:00-16:00..."
}
```
**Response (200 OK):**
```json
{
  "status": "success",
  "slots_parsed": 5,
  "conflicts_detected": 0
}
```

## Error Codes
| Code | Meaning |
|---|---|
| `UNAUTHORIZED` | Invalid or missing token. |
| `FORBIDDEN` | Role does not have permission. |
| `PARSER_ERROR` | Raw text format not recognized. |
| `DUTY_CONFLICT` | Overlap with class or other duty. |
| `BILL_NOT_READY` | Tasks missing faculty verification. |
