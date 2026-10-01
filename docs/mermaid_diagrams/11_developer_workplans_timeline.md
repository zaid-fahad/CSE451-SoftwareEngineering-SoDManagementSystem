# Developer Workplans Development Timeline

*Source Document:* [`docs/25-developer-workplans.md`](../25-developer-workplans.md)

```mermaid
flowchart TD
  subgraph MVC_FastAPI
    V[View: Pydantic Schemas] <--> C[Controller: FastAPI Routers]
    C <--> S[Services: Business Logic]
    S <--> M[Model: SQLAlchemy Database Models]
  end
  M <--> DB[(PostgreSQL Database)]
```
