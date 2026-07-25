# Developer Workplans & Step-by-Step Implementation Guide

This guide details the MVC-structured workplans for both developers. Follow these step-by-step instructions to initialize and build the application core.

---

## 1. Zaid's Workplan: FastAPI, PostgreSQL, MVC API Pattern

### Tech Stack & Pattern Overview
* **Backend:** FastAPI (Python 3.9+)
* **Database:** PostgreSQL (Relational)
* **ORM & Migrations:** SQLAlchemy (Async) + Alembic
* **Pattern: MVC (Model-View-Controller) for REST APIs:**
  * **Model (`M`):** SQLAlchemy database models representing PostgreSQL tables (`app/model/`).
  * **View (`V`):** Pydantic schemas defining the request/response payloads (Data Transfer Objects) sent over the network (`app/schemas/`).
  * **Controller (`C`):** FastAPI APIRouters, dependency injections, and business logic services processing requests (`app/router/` & `app/services/`).

---

### Step-by-Step Backend Architecture Roadmap

```mermaid
flowchart TD
  subgraph MVC_FastAPI
    V[View: Pydantic Schemas] <--> C[Controller: FastAPI Routers]
    C <--> S[Services: Business Logic]
    S <--> M[Model: SQLAlchemy Database Models]
  end
  M <--> DB[(PostgreSQL Database)]
```

#### Step 1: Directory Structure Setup
Initialize the backend workspace directory inside `backend/` following this structure (model, services, router):
```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py            # FastAPI Entry Point
│   ├── config.py          # Environment settings (pydantic-settings)
│   ├── database.py        # Async Engine & Sessionmaker
│   ├── model/             # [M] Database Models (singular: model)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── schedule.py
│   │   ├── duty.py
│   │   └── swap.py
│   ├── schemas/           # [V] Data Views (Pydantic)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── schedule.py
│   │   ├── duty.py
│   │   └── swap.py
│   ├── router/            # [C] Controllers (FastAPI Routes, singular: router)
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── schedule.py
│   │   ├── duty.py
│   │   └── swap.py
│   └── services/          # [C] Core Algorithms (Parser, Proxy Engine)
│       ├── parser.py
│       └── proxy.py
├── migrations/            # Alembic Migrations
├── alembic.ini
├── requirements.txt
└── Dockerfile
```

#### Step 2: Initialize Dependencies & Database Connection
1. Write the `requirements.txt` file:
   ```text
   fastapi>=0.100.0
   uvicorn[standard]>=0.22.0
   sqlalchemy[asyncio]>=2.0.0
   alembic>=1.11.0
   asyncpg>=0.28.0
   pydantic-settings>=2.0.0
   python-jose[cryptography]>=3.3.0
   passlib[argon2]>=1.7.4
   pytest>=7.4.0
   httpx>=0.24.0
   ```
2. Configure `app/database.py` using `asyncio` engine:
   ```python
   from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
   from sqlalchemy.orm import declarative_base
   import os

   DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/sod_db")

   engine = create_async_engine(DATABASE_URL, echo=True)
   AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
   Base = declarative_base()

   async def get_db():
       async with AsyncSessionLocal() as session:
           yield session
   ```

#### Step 3: Define Models [M] & Setup Alembic
1. Build models (`app/model/user.py`, `app/model/schedule.py`, etc.) with SQLAlchemy column constraints. Enforce unique indexing on `department_id` and user `email`.
2. Configure Alembic to read `Base.metadata` for auto-generating migrations:
   * In `migrations/env.py`:
     ```python
     from app.database import Base
     from app.model import user, schedule, duty, swap  # import all models
     target_metadata = Base.metadata
     ```
   * Create the initial migration: `alembic revision --autogenerate -m "initial_schema"`
   * Run the migration: `alembic upgrade head`

#### Step 4: Write Controllers [C] & Views [V]
1. **Epic 1 (Auth):**
   * Write Pydantic schemas in `schemas/user.py` for `UserRegister`, `UserLogin`, and `UserResponse`.
   * Create routes in `router/auth.py` verifying password hashing (Argon2) and generating JWT credentials.
2. **Epic 2 (IRAS Parser Engine):**
   * Write regex processing logic in `services/parser.py`.
   * Create `/schedule/parse` endpoint receiving raw text, executing matching rules, and bulk inserting parsed availability windows.
3. **Epic 3 & 4 (Duty & Swap Engine):**
   * Write SQL query in `services/proxy.py` to filter students by role and availability overlap, preventing duplicate assignments.
   * Write controllers handles the swap status state changes. Ensure all modifications execute inside database transaction blocks.

---

## 2. Happy's Workplan: React, TypeScript, Vite, Tailwind CSS v4, MVC

### Tech Stack & Pattern Overview
* **Frontend:** React 18+ (SPA) with TypeScript
* **Build Tool:** Vite (Super fast bundling)
* **Styling:** Tailwind CSS v4 (CSS-first configuration)
* **Pattern: MVC (Model-View-Controller) for Single Page Apps:**
  * **Model (`M`):** TypeScript interfaces defining domain objects, and global state providers/contexts (`src/model/` & `src/context/`).
  * **View (`V`):** Interactive presentational screens, layouts, and reusable components (`src/component/` & `src/pages/`).
  * **Controller (`C`):** Custom hooks, layout definitions, and API Fetch modules managing state transformations and communicating with the FastAPI server (`src/services/` & `src/layout/`).

---

### Step-by-Step Frontend Architecture Roadmap

```mermaid
flowchart TD
  subgraph MVC_React
    V[View: Components / Pages] <--> C[Controller: Custom Hooks / Services]
    C <--> M[Model: TypeScript Types / Context Store]
  end
  C <--> API[FastAPI Backend Endpoint]
```

#### Step 1: Directory Structure Setup
Initialize the frontend project directory inside `frontend/` following this structure (component, pages, services, layout):
```text
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── model/             # [M] TypeScript Interfaces (singular: model)
│   │   ├── user.ts
│   │   ├── schedule.ts
│   │   └── duty.ts
│   ├── context/           # [M] State Stores (AuthContext)
│   │   └── AuthContext.tsx
│   ├── layout/            # [V] Layout Shells (e.g., AppLayout, AuthLayout)
│   │   ├── AppLayout.tsx
│   │   └── Sidebar.tsx
│   ├── component/         # [V] Reusable elements (Navbar, Grid, Button)
│   │   ├── Navbar.tsx
│   │   ├── AvailabilityGrid.tsx
│   │   └── UI/
│   ├── pages/             # [V] Screen Views (Login, Dashboard)
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   └── SwapPortal.tsx
│   ├── services/          # [C] Custom hooks & API Fetch Clients (useAuth, api)
│   │   ├── api.ts
│   │   ├── useAuth.ts
│   │   ├── useParser.ts
│   │   └── useSwaps.ts
├── package.json
├── tsconfig.json
├── vite.config.ts         # Vite build config
└── tailwind.config.js     # (V4 does not need this, configure inside index.css)
```

#### Step 2: Initialize Project & Configure Tailwind CSS v4
1. Scaffold the project using Vite:
   ```bash
   npm create vite@latest frontend -- --template react-ts
   cd frontend
   npm install
   ```
2. Install Axios, React Router, and Tailwind CSS v4:
   ```bash
   npm install axios react-router-dom html2canvas
   npm install tailwindcss @tailwindcss/vite
   ```
3. Update `vite.config.ts` to include the Tailwind v4 plugin:
   ```typescript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import tailwindcss from '@tailwindcss/vite'

   export default defineConfig({
     plugins: [
       react(),
       tailwindcss()
     ]
   })
   ```
4. Initialize Tailwind v4 inside your main CSS file (`src/index.css`):
   ```css
   @import "tailwindcss";

   /* Tailwind v4 theme configurations go directly here */
   @theme {
     --color-primary: #10b981;    /* Emerald theme */
     --color-secondary: #0f172a;  /* Dark slate */
     --color-accent: #f59e0b;     /* Amber alert accents */
   }
   ```

#### Step 3: Implement Models [M] & Controller Hooks [C]
1. Write interfaces (`src/model/user.ts`):
   ```typescript
   export interface User {
     id: string;
     department_id: string;
     name: string;
     email: string;
     role: 'Student' | 'Faculty' | 'LabManager' | 'DeptManager';
   }
   ```
2. Create custom hook controller (`src/controllers/useAuth.ts`) to encapsule state adjustments and redirect actions:
   ```typescript
   import { useContext } from 'react';
   import { AuthContext } from '../context/AuthContext';

   export const useAuth = () => {
     const context = useContext(AuthContext);
     if (!context) throw new Error("useAuth must be used within an AuthProvider");
     return context;
   };
   ```

#### Step 4: Develop Presentational Views [V]
1. **Login & Registration Pages:** Build custom styled forms using Tailwind v4 classes.
2. **Availability Grid Component:** Develop an interactive CSS Grid matching the days and hours, using conditional styling to show class conflicts.
3. **Export Utility:** Set up a button that passes the DOM element of the Availability Grid to `html2canvas` and triggers a browser file download of the visual PNG.
