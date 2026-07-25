# Departmental SoD Management System - Non-Functional Requirements

| NFR ID | Category | Requirement (Measurable Target) |
|---|---|---|
| **Performance** | | |
| NFR-001 | Latency | P95 response time for dashboard loading shall be < 500 ms. |
| NFR-002 | Parser Speed | The IRAS text parser shall process a full semester schedule in < 2 seconds. |
| NFR-003 | Throughput | System shall handle up to 20 concurrent users (departmental scale). |
| **Security** | | |
| NFR-004 | Encryption | All sensitive data (PII, Financials) shall be encrypted at rest and in transit (TLS 1.2+). |
| NFR-005 | Passwords | Passwords shall be hashed using Argon2 or BCrypt with a high salt cost. |
| NFR-006 | Session | JWT access tokens shall expire after 30 minutes; Refresh tokens after 7 days. |
| **Reliability** | | |
| NFR-007 | Uptime | The system shall maintain 99.5% availability during the academic semester. |
| NFR-008 | Data Integrity| Database shall use ACID-compliant transactions for all billing operations. |
| **Usability** | | |
| NFR-09 | Mobile First | The student dashboard and schedule export shall be fully mobile-responsive. |
| NFR-010 | Intuition | A first-time student shall be able to parse their schedule in < 1 minute. |
| **Maintainability** | | |
| NFR-011 | Documentation| All API endpoints shall be documented using Swagger/OpenAPI. |
| NFR-012 | Coverage | Backend business logic shall have >= 80% unit test coverage. |
| NFR-013 | Logs | System shall use structured logging for all security and financial events. |

## NFR Verification Matrix
| Category | Method |
|---|---|
| Performance | Load testing with JMeter/Locust. |
| Security | OWASP ZAP scanning and manual code review. |
| Reliability | Chaos testing (container restarts) and backup restoration drills. |
| Usability | User testing with a group of 5 students and 2 faculty members. |
| Maintainability| CI/CD pipeline checks for test coverage and linting. |
