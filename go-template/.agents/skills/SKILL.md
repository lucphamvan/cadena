---
name: go-template-project
description: Clean Architecture Go backend template with Gin, GORM, feature toggles, JWT/OAuth auth, and optional infrastructure (PostgreSQL, MySQL, MongoDB, Redis, Kafka, WebSocket, SSE)
---

# Go Template — Agent Skill

## Overview

This is a production-ready Go backend template following **Clean Architecture** principles.
The project uses **Gin v1.11** as the HTTP framework, **GORM** as the ORM for type-safe
database operations, and a feature-toggle system that makes all infrastructure opt-in.

- **Module**: `github.com/your-org/go-template`
- **Go version**: 1.24+ (see `go.mod`)
- **Build**: `make build` / `make dev` / `go build ./...`
- **Always** run `go mod tidy` after adding/removing dependencies

---

## Architecture

```
Dependency flow: delivery → usecase → domain ← infrastructure
```

| Layer | Path | Role |
|-------|------|------|
| **Domain** | `internal/domain/entity/` | Business entities / GORM models (User, Product, Auth DTOs) |
| **Domain** | `internal/domain/repository/` | Repository **interfaces** (ports) |
| **Use Case** | `internal/usecase/` | Business logic; depends only on interfaces |
| **Delivery** | `internal/delivery/http/handler/` | Gin HTTP handlers |
| **Delivery** | `internal/delivery/http/middleware/` | Middleware (auth, CORS, logging, rate-limit, recovery, request-id) |
| **Delivery** | `internal/delivery/http/router/` | Route definitions |
| **Delivery** | `internal/delivery/websocket/` | WebSocket hub |
| **Delivery** | `internal/delivery/sse/` | SSE broker |

| **Repository** | `internal/repository/postgres/` | PostgreSQL repo adapters (GORM) |
| **Migrations** | `migrations/` | SQL migration files (reference — GORM auto-migrates) |
| **Infra** | `pkg/database/{postgres,mysql,mongodb}/` | DB connection clients |
| **Infra** | `pkg/redis/` | Redis client + CacheAdapter |
| **Infra** | `pkg/kafka/` | Kafka producer, consumer, EventAdapter (segmentio/kafka-go) |
| **Infra** | `pkg/token/` | JWT Manager (access + refresh tokens) |
| **Infra** | `pkg/logger/` | Structured logging (zerolog) |
| **Infra** | `pkg/response/` | Standard HTTP response helpers |
| **Infra** | `pkg/apperror/` | Application error types with HTTP status codes |
| **Infra** | `pkg/validator/` | Request binding + struct validation |
| **Wiring** | `internal/app/app.go` | Server lifecycle (init, run, shutdown) + auto-migration |
| **Wiring** | `internal/app/wire.go` | Dependency injection (repos, use cases, handlers, router) |
| **Config** | `config/config.go`, `config/config.yaml` | YAML config with `${VAR}` env substitution |

---

## Feature Toggles

All infrastructure is opt-in via `config/config.yaml`:

```yaml
features:
  postgres:   { enabled: true }
  mysql:      { enabled: false }
  mongodb:    { enabled: false }
  redis:      { enabled: false }
  kafka:      { enabled: false }
  websocket:  { enabled: false }
  sse:        { enabled: false }
```

Disabled components are `nil` at runtime — **always nil-check** before use.
PostgreSQL is required — the app will not start without it.

---

## GORM Integration

- ORM: **GORM v2** (`gorm.io/gorm`)
- Driver: `gorm.io/driver/postgres`
- Entity models in `internal/domain/entity/` serve as both domain objects and GORM models
- Each entity has GORM struct tags (`gorm:"..."`) and a `TableName()` method
- **Auto-migration** runs at startup in `app.go` → `initInfrastructure()`
- Repository implementations use `*gorm.DB` directly — no code generation needed
- Use `db.WithContext(ctx)` for all queries to propagate request context

### GORM Repository Pattern
```go
type UserRepository struct {
    db *gorm.DB
}

func NewUserRepository(client *pgdb.Client) *UserRepository {
    return &UserRepository{db: client.DB}
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*entity.User, error) {
    var user entity.User
    result := r.db.WithContext(ctx).Where("id = ?", id).First(&user)
    if result.Error != nil {
        if errors.Is(result.Error, gorm.ErrRecordNotFound) {
            return nil, apperror.Wrap(apperror.ErrNotFound, result.Error)
        }
        return nil, apperror.Wrap(apperror.ErrInternalServer, result.Error)
    }
    return &user, nil
}
```

---

## Adding a New Domain Feature — Step by Step

1. **Entity** → `internal/domain/entity/<name>.go`
   - Define struct with `json`, `validate`, and `gorm` tags
   - Add `TableName()` method
   - Define `Create<Name>Input` / `Update<Name>Input` with `validate:"..."` tags
2. **Repository interface** → `internal/domain/repository/<name>_repository.go`
   - Define an interface with CRUD methods accepting `context.Context`
3. **Use case** → `internal/usecase/<name>_usecase.go`
   - Define public interface + private struct; accept repo interface, not concrete type
   - Constructor: `NewXxxUseCase(repo, cache, events, log) XxxUseCase`
4. **Handler** → `internal/delivery/http/handler/<name>_handler.go`
   - Use `validator.BindAndValidate(c, &input)` for request binding
   - Use `response.OK(c, data)` / `response.Created(c, data)` for responses
   - Use `handleError(c, err)` for error mapping (copy from `user_handler.go`)
5. **Route** → `internal/delivery/http/router/router.go`
   - Add handler to `router.Config`, register under `v1.Group(/<name>s)`
6. **Wire** → `internal/app/wire.go`
   - Instantiate repo, use case, handler; pass handler into `router.Config`
7. **DB adapter** → `internal/repository/postgres/<name>_repository.go`
8. **Auto-migrate** → Add `&entity.<Name>{}` to `app.pgClient.AutoMigrate(...)` in `app.go`

---

## Key Patterns & Conventions

### Error Handling (pkg/apperror)
```go
return apperror.Wrap(apperror.ErrNotFound, err)       // wraps with HTTP status
return apperror.Wrap(apperror.ErrConflict, fmt.Errorf("already exists"))
return apperror.Wrap(apperror.ErrInternalServer, err)
```
Handler maps errors via `handleError(c, err)` — defined in each handler file.

### HTTP Responses (pkg/response)
```go
response.OK(c, data)
response.Created(c, data)
response.WithMeta(c, data, &response.Meta{Page: 1, Total: 100})
response.BadRequest(c, "message")
```

### Request Binding & Validation (pkg/validator)
```go
var input entity.CreateUserInput
if !validator.BindAndValidate(c, &input) {
    return // 400 already written
}
```
**Never** use bare `c.ShouldBindJSON` — it skips struct-level validation.

### Path & Query Params
```go
id := c.Param("id")          // path param /:id
page := c.Query("page")      // query string ?page=1
```

### Auth Middleware
```go
userID := middleware.GetUserID(c)   // from c.GetString(middleware.UserIDKey)
role   := middleware.GetUserRole(c) // from c.GetString(middleware.UserRoleKey)
```
- Middleware only accepts **access tokens** (`token_type="access"`)
- JWT types: `access` (15 min), `refresh` (7 days)
- Passwords: always hashed with `bcrypt.DefaultCost`

### Logging (pkg/logger — zerolog)
```go
l := log.WithComponent("user-usecase")
l.Info().Str("user_id", id).Msg("user created")
```

### Use Case Pattern
- Public **interface** + private **struct** implementing it
- Constructor accepts repository interfaces + optional infra (cache, events)
- Nil-check optional deps: `if uc.cache != nil { ... }`

### Wiring (wire.go)
- Requires PostgreSQL — no in-memory fallback
- Optional adapters: Redis → `CacheRepository`, Kafka → `EventPublisher`
- Token manager from config: `token.NewManager(secret, accessExp, refreshExp)`

---

## Authentication

Routes wired under `/api/v1/auth/`:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Email/password registration |
| POST | `/auth/login` | — | Email/password login |
| POST | `/auth/refresh` | — | Issue new token pair from refresh token |
| POST | `/auth/logout` | Bearer | Blacklist refresh token |
| GET | `/auth/google` | — | Redirect to Google consent page |
| GET | `/auth/google/callback` | — | OAuth2 callback → token pair |

- **Token blacklist**: SHA-256 hash stored in Redis (`auth:blacklist:<hash>`) with TTL
- **Google OAuth CSRF**: random state stored in HTTPOnly cookie (`oauth_state`)

---

## Middleware Chain (router.go, outermost first)

```
Recovery → Logging → RateLimit → CORS → RequestID → routes
```

Auth middleware is **not** global — attach per-route group:
```go
protected := v1.Group("/users")
protected.Use(middleware.Auth(tokenMgr))
```

---

## Infrastructure Adapters

| Adapter | Pkg | Implements |
|---------|-----|------------|
| Redis cache | `pkg/redis/` → `CacheAdapter` | `repository.CacheRepository` |
| Kafka events | `pkg/kafka/` → `EventAdapter` | `repository.EventPublisher` |

Wire in `app.go` when feature is enabled:
```go
if app.redisClient != nil {
    cache = app.redisClient  // implements CacheRepository
}
if app.kafkaProd != nil {
    events = kafka.NewEventAdapter(app.kafkaProd)
}
```

---

## Kafka (segmentio/kafka-go v0.4)

- **Producer**: `pkg/kafka.Producer` — `producer.WriteMessage(ctx, topic, key, value)`
- **EventAdapter**: `pkg/kafka.EventAdapter` — implements `repository.EventPublisher`
- **Consumer**: `pkg/kafka.Consumer` — per-topic via `kafka.NewConsumer(cfg, topic, log)`
- Consumer loop: `consumer.Consume(ctx, func(msg kafka.Message) error { ... })`

---

## WebSocket & SSE

- **WebSocket**: `internal/delivery/websocket/Hub` — `hub.GinHandler()` returns `gin.HandlerFunc`
  - `hub.Broadcast([]byte)` to push to all clients
- **SSE**: `internal/delivery/sse/Broker` — `broker.GinHandler()` returns `gin.HandlerFunc`
  - `broker.Publish(sse.Event{Event: "update", Data: "..."})` to stream
- Both run goroutine loops via `.Run(ctx)` started in `app.go`

---

## Build & Run

```bash
make dev          # go run ./cmd/server/ (no build step)
make build        # go build → bin/go-template
make run          # build + run
make test         # go test -v -race -cover ./...
make lint         # golangci-lint run
make tidy         # go mod tidy
make docker-build # docker build
make docker-run   # docker run
docker-compose up -d  # all services (postgres, redis, kafka, etc.)
```

---

## Production Checklist

- [ ] Set `JWT_SECRET` env var
- [ ] Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- [ ] Set `cors.allowed_origins` to frontend domain(s)
- [ ] Enable Redis for token blacklist + cache
- [ ] Ensure PostgreSQL is running and accessible
- [ ] Set `app.env: production`
- [ ] Use HTTPS — update Google redirect URL and set Secure flag on cookies
