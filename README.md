# Passman NextGen 🔐

> **A container-ready, full-stack password manager (FastAPI + PostgreSQL + React) that encrypts every credential with AES-GCM and protects accounts with Argon2-hashed master passwords.**

[![CI](https://github.com/medTrigui/passman-nextgen/actions/workflows/ci.yml/badge.svg)](https://github.com/medTrigui/passman-nextgen/actions/workflows/ci.yml)

---

## Table of Contents
1. [Features](#features)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Getting Started (🐳 Docker)](#getting-started-docker)
6. [Environment Variables](#environment-variables)
7. [Database Migrations](#database-migrations)
8. [Running Tests](#running-tests)
9. [API Reference](#api-reference)
10. [Roadmap](#roadmap)
11. [Security Notes](#security-notes)
12. [Contributing](#contributing)
13. [License](#license)

---

## Features
| Capability | Notes |
|------------|-------|
| **User registration & JWT login** | Argon2id password hashing |
| **Store / view / update / delete site passwords** | AES-256-GCM encryption, per-row IV |
| **Password generator** | Custom length & character set |
| **Containerised stack** | `docker compose up` spins up Postgres, API, UI, pgAdmin |
| **OpenAPI docs** | `http://localhost:8000/docs` auto-generated |
| **Rate-limiting & audit logs** | Planned in v0.2 |
| **2-Factor Authentication** | Planned in v0.3 |

---

## Architecture

```mermaid
graph TD
  subgraph Browser
    A["React SPA - localhost:5173"]
  end

  subgraph Container_1[FastAPI - backend]
    API["FastAPI + Uvicorn"]
    Worker["Async SQLAlchemy"]
  end

  subgraph Container_2[Nginx - frontend]
    FE["Serves static - React build"]
  end

  subgraph Container_3[PostgreSQL]
    DB["passman"]
  end

  subgraph Container_4[pgAdmin]
    AdminUI["pgAdmin4"]
  end

  A -- REST / JWT --> FE
  FE -- proxy --> API
  API -- asyncpg --> DB
  AdminUI -- 5432/TCP --> DB



## Project Structure
passman-nextgen/
│
├── .github/workflows/ci.yml   # GitHub Actions (lint + tests)
├── .env.example               # copy to .env and fill secrets
├── docker-compose.yml
│
├── backend/
│   ├── Dockerfile
│   ├── pyproject.toml         # Poetry dependencies
│   └── app/
│       ├── main.py            # FastAPI app factory
│       ├── core/              # settings, security helpers
│       ├── models/            # SQLAlchemy ORM
│       ├── schemas/           # Pydantic DTOs
│       ├── routers/           # HTTP endpoint modules
│       ├── services/          # crypto, business logic
│       └── tests/             # pytest suite
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── api/               # Axios client generated from OpenAPI
        ├── pages/             # React Router routes
        ├── components/        # reusable UI widgets
        └── hooks/

## Getting Started (Docker)
# 1. Clone
git clone https://github.com/medTrigui/passman-nextgen.git
cd passman-nextgen

# 2. Configure env vars
cp .env.example .env   # edit values in .env

# 3. Build & run
docker compose up --build

# 4. Open the app
# - Frontend: http://localhost:5173
# - API docs: http://localhost:8000/docs
# - pgAdmin:  http://localhost:5050  (use creds from .env)

