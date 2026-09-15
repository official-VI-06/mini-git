# Mini-Git

A simplified reimplementation of Git's core object model — content-addressable blobs, trees, and commits hashed with SHA-1 — built on top of Postgres instead of a local `.git` folder. A Spring Boot API exposes the core Git verbs (`init`, `add`, `commit`, `log`, `branch`, `checkout`, `diff`), and a React single-page app puts a GitHub-Desktop-style UI on top of it.

## Features

- **Repository management** — create repositories, each with its own isolated object store
- **Staging & commits** — stage files through an in-browser editor, commit them with a message and author
- **Branching** — create branches and switch between them
- **Commit history** — walk a branch's commit chain and view it as a graph
- **Diffing** — compare any two commits with a from-scratch LCS (longest common subsequence) line diff
- **Auth** — email/password sign-up and sign-in via Supabase Auth

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 4 (`spring-boot-starter-webmvc`), Maven |
| Persistence | Supabase (Postgres + PostgREST + Auth) |
| Backend ↔ DB | Raw `java.net.http.HttpClient` calls against Supabase's PostgREST API — no JPA/Hibernate |
| Diffing | Hand-written LCS dynamic-programming diff (`LCSDiff`) |
| Frontend | React 19, Vite 8, react-router-dom 7 |
| Styling | Tailwind CSS 4 |

## Architecture

```
Browser (React SPA)
  ├── Supabase Auth ─────────────► sign-in / sign-up / session
  ├── @supabase/supabase-js ─────► direct reads: repos, head, refs, staging
  └── /api/* (fetch) ────────────► Spring Boot RepoController
                                        │
                                        ▼
                                   Command (Init/Add/Commit/Branch/Checkout/Diff)
                                        │
                                        ▼
                                   Repository service
                                        │
                                        ▼
                                   SupabaseClient (HttpClient)
                                        │
                                        ▼
                                   Supabase Postgres (via PostgREST)
```

The frontend talks to Supabase two ways: directly (via `@supabase/supabase-js`) for authentication and simple reads, and through the Spring Boot API for anything that needs actual Git semantics — hashing a blob, building a tree, walking commit history, computing a diff.

### Object model

Every object (`Blob`, `Tree`, `Commit`) extends `GitObject`, serializes itself to a deterministic byte layout, and hashes that layout with SHA-1 to derive its own identity — the same content-addressing idea Git itself is built on. Objects are persisted as rows in a single `objects` table, keyed by their hash.

## Data model

No migrations ship with this repo — the schema below is what the code reads and writes.

| Table | Fields | Purpose |
|---|---|---|
| `repos` | `id, name, user_id, created_at` | One row per repository |
| `head` | `repo_id, branch_name` | Currently checked-out branch |
| `refs` | `repo_id, name, commit_hash` | One row per branch, pointing at its tip commit |
| `staging` | `repo_id, file_path, blob_hash` | Files queued for the next commit |
| `objects` | `hash, repo_id, type, content` | The object store — blobs, trees, and commits, keyed by SHA-1 hash |

## Getting started

### Prerequisites

- Java 21+
- Node.js 18+
- A [Supabase](https://supabase.com) project (Postgres + Auth)

### 1. Set up Supabase

Create a Supabase project, then create the five tables listed above (no migration files are provided — set columns to match the fields listed in [Data model](#data-model)).

### 2. Backend

```bash
cd backend
```

Configure `src/main/resources/application.properties`:

```properties
spring.application.name=minigit
supabase.url=<your-supabase-project-url>
supabase.apiKey=<your-supabase-service-role-or-secret-key>
```

> **Do not commit real Supabase keys.** Use environment variables (`SUPABASE_URL` / `SUPABASE_APIKEY` via Spring's `${...}` property placeholders) instead of hardcoding them, especially before pushing to a public repo.

Run the API (defaults to `http://localhost:8080`):

```bash
./mvnw spring-boot:run
```

### 3. Frontend

```bash
cd frontend
npm install
```

Configure `frontend/.env`:

```
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon/publishable-key>
```

Run the dev server:

```bash
npm run dev
```

By default Vite serves on `http://localhost:5173`; the backend's `@CrossOrigin` in `RepoController` is currently set to `http://localhost:5174` — update one or the other to match if you hit CORS errors.

## API reference

All endpoints are under `/api`.

| Method | Path | Body / Query | Description |
|---|---|---|---|
| `POST` | `/init` | `{ repoName, userId }` | Create a new repository |
| `POST` | `/add` | `{ repoId, filePath, content }` | Stage a file |
| `POST` | `/commit` | `{ repoId, message, author }` | Commit staged files |
| `GET` | `/log?repoId=` | — | List commits on the current branch |
| `POST` | `/branch` | `{ repoId, branchName }` | Create a branch at the current commit |
| `POST` | `/checkout` | `{ repoId, targetBranch }` | Switch the current branch |
| `POST` | `/diff` | `{ repoId, hashA, hashB }` | Diff two commits, file by file |

Every response is a `CommandResult`: `{ success, message, data }`.

## Project structure

```
backend/
  src/main/java/com/minigit/
    command/      # One Command class per Git verb (Command pattern)
    controller/    # RepoController — REST endpoints
    model/         # GitObject, Blob, Tree, Commit, CommandResult
    repository/    # Repository — persistence facade over Supabase
    service/       # SupabaseClient (HTTP client), DiffStrategy + LCSDiff
frontend/
  src/
    api/           # Thin fetch wrapper around the backend REST API
    components/    # Navbar, FileEditor, DiffViewer, CommitGraph
    pages/         # Login, Signup, Dashboard, Repository, CommitLog
    supabase/      # Supabase client (auth + direct reads)
```

## Known limitations

- No authentication on the backend — the API trusts whatever `repoId`/`author` a client sends; all real auth happens in the frontend via Supabase
- `Tree` entries are stored in a `HashMap`, so serialization order (and therefore its hash) isn't guaranteed stable
- `Commit` stores a single `parentHash` — no merge commits
- `Checkout` only switches which branch new commits attach to; it doesn't restore file contents
- No automated tests beyond the default Spring Boot smoke test
