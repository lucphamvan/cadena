# Employee Portal — Backend API

A Go backend for the **Employee Portal** web app, built with **Clean Architecture**, **Gin**, and **GORM**.

Employees can view/edit their profiles, upload photos, manage skills, and track change history.

## Architecture

```
cmd/server/           → Entry point
config/               → YAML config + loader
internal/
  app/                → Bootstrap + dependency injection
  domain/
    entity/           → User, UserActivity, ProfileChangeHistory, Auth DTOs
    repository/       → Repository interfaces (ports)
  usecase/            → Business logic
  delivery/
    http/
      handler/        → HTTP handlers (auth, user/profile)
      middleware/      → Auth, CORS, logging, rate-limit, recovery, request-id
      router/         → Route definitions
  repository/
    postgres/         → GORM repository implementations
pkg/
  database/postgres/  → GORM client
  redis/              → Redis client (optional cache)
  logger/             → Structured logging (zerolog)
  response/           → HTTP response helpers
  apperror/           → App error types
  validator/          → Request validation
  token/              → JWT manager
```

## Quick Start

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Run the server
make dev

# Or build and run
make build
./bin/go-template -config config/config.yaml
```

## API Endpoints

### Auth

| Method | Path                    | Auth   | Description                                       |
| ------ | ----------------------- | ------ | ------------------------------------------------- |
| POST   | `/api/v1/auth/register` | —      | Register (email, password, first_name, last_name) |
| POST   | `/api/v1/auth/login`    | —      | Login → access + refresh tokens                   |
| POST   | `/api/v1/auth/refresh`  | —      | Refresh token pair                                |
| POST   | `/api/v1/auth/logout`   | Bearer | Logout (blacklist refresh token)                  |

### Profile

| Method | Path                      | Auth   | Description                          |
| ------ | ------------------------- | ------ | ------------------------------------ |
| GET    | `/api/v1/profile`         | Bearer | View own profile                     |
| PUT    | `/api/v1/profile`         | Bearer | Update profile (multipart/form-data) |
| GET    | `/api/v1/profile/history` | Bearer | Change history grouped by activity (?days=7) |

### Skills

| Method | Path             | Auth | Description                  |
| ------ | ---------------- | ---- | ---------------------------- |
| GET    | `/api/v1/skills` | —    | List available skill options |

### Health

| Method | Path            | Description     |
| ------ | --------------- | --------------- |
| GET    | `/health/live`  | Liveness probe  |
| GET    | `/health/ready` | Readiness probe |

## Update Profile

`PUT /api/v1/profile` accepts **multipart/form-data**:

| Field     | Type   | Description                       |
| --------- | ------ | --------------------------------- |
| `phone`   | string | Mobile phone number               |
| `email`   | string | Work email                        |
| `address` | string | Residential address               |
| `skills`  | string | JSON array, e.g. `["Go","React"]` |
| `photo`   | file   | Profile photo (optional)          |

> **Note:** `first_name` and `last_name` are **read-only** — set at registration only.

## Configuration

Edit `config/config.yaml`:

```yaml
features:
  postgres: { enabled: true }
  redis: { enabled: false }

employee:
  skill_options:
    - "Go"
    - "React"
    - "Flutter"
    - "CI/CD"
    - "Python"
    - "AWS"
    - "Kubernetes"
  change_history_days: 7
```

Environment variables supported:

```yaml
postgres:
  password: ${POSTGRES_PASSWORD}
jwt:
  secret: ${JWT_SECRET}
```

## Key Design Decisions

- **GORM** for ORM + auto-migration (no manual SQL migrations needed)
- **Skills** stored as JSON array in `users` table via GORM serializer
- **Change history** groups multiple field changes under a single `UserActivity` with associated `ProfileChangeHistory` details. Tracked changes include IP address and Device.
- **Profile photo** saved to `uploads/` directory, served as static files
- **JWT auth** with access (15min) + refresh (7d) token pair
- **Redis** optional — used for token blacklist + cache when enabled

## License

MIT
