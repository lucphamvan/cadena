# Copilot Instructions

## Module & Build

- Module: `github.com/your-org/go-template`
- Go 1.24+ required
- HTTP framework: **gin-gonic/gin v1.11**
- ORM: **GORM** (gorm.io/gorm)
- Kafka client: **segmentio/kafka-go v0.4**
- Build: `make build` or `go build ./...`
- Run locally (no external deps): `make dev`
- Always run `go mod tidy` after adding dependencies

## Architecture: Clean Architecture Layers

Dependency direction: `delivery` -> `usecase` -> `domain` <- `infrastructure`

| Layer | Path | Role |
|-------|------|------|
| Domain | `internal/domain/entity/`, `internal/domain/repository/` | Entities (GORM models) + repository **interfaces** (ports) |
| Use Case | `internal/usecase/` | Business logic; depends only on interfaces |
| Delivery | `internal/delivery/http/`, `internal/delivery/websocket/`, `internal/delivery/sse/` | Gin handlers, WebSocket hub, SSE broker |
| Infrastructure | `pkg/database/`, `pkg/redis/`, `pkg/kafka/`, `pkg/token/` | Concrete clients |
| Migrations | `migrations/` | SQL migration files (reference only — GORM auto-migrates) |
| Repositories | `internal/repository/postgres/` | Concrete repository implementations (GORM) |
| Wiring | `internal/app/app.go`, `internal/app/wire.go` | Server lifecycle + dependency injection |

## Feature Toggles

All infrastructure is opt-in via `config/config.yaml`:

```yaml
features:
  postgres:   { enabled: false }
  mysql:      { enabled: false }
  mongodb:    { enabled: false }
  redis:      { enabled: false }
  kafka:      { enabled: false }
  websocket:  { enabled: false }
  sse:        { enabled: false }
```

Disabled components are `nil` at runtime — always nil-check before use.
PostgreSQL is required — the app will not start without it.

## GORM Integration

- ORM: **GORM v2** (`gorm.io/gorm`)
- Driver: `gorm.io/driver/postgres` (for PostgreSQL)
- Entity models in `internal/domain/entity/` serve as both domain objects and GORM models
- Each entity defines GORM struct tags (`gorm:"..."`) and a `TableName()` method
- **Auto-migration** runs at startup in `app.go` → `initInfrastructure()` when postgres is enabled
- Repository implementations in `internal/repository/postgres/` use `*gorm.DB` directly
- **No code generation needed** — GORM handles queries at runtime

### Adding a new table
1. Define entity with GORM tags in `internal/domain/entity/<name>.go`
2. Add `&entity.<Name>{}` to `AutoMigrate()` call in `internal/app/app.go`
3. That's it — the table is created/updated automatically

## Adding a New Domain Feature

1. **Entity** in `internal/domain/entity/<name>.go`
   - Define struct with `json`, `validate`, and `gorm` tags
   - Add `TableName()` method
2. **Repository interface** in `internal/domain/repository/<name>_repository.go`
3. **Use case** in `internal/usecase/<name>_usecase.go` — define public interface + private struct; accept interface, not concrete type
4. **Handler** in `internal/delivery/http/handler/<name>_handler.go` using `*gin.Context`
5. **Route** in `internal/delivery/http/router/router.go` — add handler to `Config` struct, register under route group
6. **Wire** in `internal/app/wire.go` — instantiate repo, usecase, handler; pass into `router.Config`
7. **DB adapter** in `internal/repository/postgres/`
8. **Auto-migrate** — add `&entity.<Name>{}` to `app.pgClient.AutoMigrate(...)` in `app.go`

## Key Patterns

**Error handling** — use `pkg/apperror`:
```go
return apperror.Wrap(apperror.ErrNotFound, err)  // wraps with HTTP status
```
Handler maps errors via `handleError(c, err)` in each handler file.

**HTTP responses** — always use `pkg/response` helpers with `*gin.Context`:
```go
response.OK(c, data)
response.Created(c, data)
response.WithMeta(c, data, &response.Meta{Page: 1, Total: 100})
response.BadRequest(c, "message")
```

**Request binding & validation** — always use `pkg/validator.BindAndValidate` in handlers  
(enforces both JSON binding and `validate:"..."` struct tags):
```go
var input entity.CreateUserInput
if !validator.BindAndValidate(c, &input) {
    return // 400 already written
}
```
Never use bare `c.ShouldBindJSON` — it skips struct-level validation.

**Path & query params** — use gin context:
```go
id := c.Param("id")          // path param /:id
page := c.Query("page")      // query string ?page=1
```

**Auth middleware** — sets user claims in gin context:
```go
userID := middleware.GetUserID(c)   // from c.GetString(middleware.UserIDKey)
role   := middleware.GetUserRole(c) // from c.GetString(middleware.UserRoleKey)
```
The middleware only accepts **access tokens** (token_type="access").  
Never pass refresh tokens to the Authorization header.

**Logging** — zerolog via `pkg/logger`; use `log.WithComponent("name")` in each pkg:
```go
l := log.WithComponent("user-usecase")
l.Info().Str("user_id", id).Msg("user created")
```

**Use case pattern** — public interface + private struct:
```go
type UserUseCase interface { ... }

type userUseCase struct {
    userRepo repository.UserRepository
    cache    repository.CacheRepository
    events   repository.EventPublisher
    log      *logger.Logger
}

func NewUserUseCase(repo, cache, events, log) UserUseCase { ... }
```
Nil-check optional deps: `if uc.cache != nil { ... }`

**Config values** in YAML support `${VAR}` substitution (expanded in `config.Load()`).  
After loading, call `cfg.Validate()` (done in `app.go`) to catch missing required fields.

**GORM repository pattern** — use `*gorm.DB` with context:
```go
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

## Middleware Chain (applied in router.go, outermost first)

Recovery -> Logging -> RateLimit -> CORS -> RequestID -> gin routes

Auth middleware (`middleware/auth.go`) is **not** applied globally — attach per-route group:
```go
protected := v1.Group("/users")
protected.Use(middleware.Auth(tokenMgr))
protected.GET("", ...)
```

## Authentication

Auth routes are in `internal/delivery/http/handler/auth_handler.go` and wired under `/api/v1/auth/`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | — | Email/password registration |
| POST | `/api/v1/auth/login` | — | Email/password login |
| POST | `/api/v1/auth/refresh` | — | Issue new token pair from refresh token |
| POST | `/api/v1/auth/logout` | Bearer | Blacklist refresh token |
| GET | `/api/v1/auth/google` | — | Redirect to Google consent page |
| GET | `/api/v1/auth/google/callback` | — | OAuth2 callback → token pair |

**JWT token types** — `pkg/token.Manager` issues two distinct token types:
- `access` (short-lived, 15 min) — send in `Authorization: Bearer <token>` header
- `refresh` (long-lived, 7 days) — send only to `/auth/refresh` and `/auth/logout` endpoints

Both types embed `token_type` as a JWT claim.  
`ValidateAccess` / `ValidateRefresh` enforce type correctness.

**Passwords** — always hashed with `bcrypt.DefaultCost` before storing.  
Never store or log plaintext passwords.

**Google OAuth CSRF** — `GoogleLogin` generates a cryptographically random state,  
stores it in a short-lived HTTPOnly cookie (`oauth_state`), and `GoogleCallback`  
validates it before exchanging the code. Never hardcode or reuse state values.

**Token blacklist** — `Logout` stores a SHA-256 hash of the refresh token in Redis  
(key: `auth:blacklist:<hash>`) with TTL = remaining token lifetime.  
When Redis is disabled, logout is stateless (client must discard token).

## Infrastructure Adapters

Concrete infra packages implement domain interfaces via adapter types:

| Adapter | File | Interface |
|---------|------|-----------|
| Redis cache | `pkg/redis/` (CacheAdapter) | `repository.CacheRepository` |
| Kafka events | `pkg/kafka/event_adapter.go` | `repository.EventPublisher` |

Wire adapters in `wire.go` when the corresponding feature is enabled:
```go
if app.redisClient != nil {
    cache = app.redisClient   // implements CacheRepository
}
if app.kafkaProd != nil {
    events = kafka.NewEventAdapter(app.kafkaProd)
}
```

## Wiring (wire.go)

The `wire()` method in `internal/app/wire.go` is the **single place** for dependency injection:
- Requires PostgreSQL — no in-memory fallback
- Instantiates repos, usecases, handlers
- Configures optional adapters (cache, events)
- Creates token manager from config
- Sets up WebSocket hub and SSE broker (if enabled)
- Returns `http.Handler` from `router.New()`

## CORS

Allowed origins are configured in `config.yaml` under `cors.allowed_origins`.  
Default is `["*"]` (development only). Lock down to specific origins in production.

## Kafka (segmentio/kafka-go)

- **Producer**: `pkg/kafka.Producer` — call `producer.WriteMessage(ctx, topic, key, value)`
- **EventAdapter**: `pkg/kafka.EventAdapter` — implements `repository.EventPublisher`
- **Consumer**: `pkg/kafka.Consumer` — created per topic via `kafka.NewConsumer(cfg, topic, log)`
- Consumer loop: `consumer.Consume(ctx, func(msg kafka.Message) error { ... })`
- `NewProducer` is topic-agnostic; topic is set per message.
- Create domain-specific consumers in `app.go` per feature:
  ```go
  cons, _ := kafka.NewConsumer(cfg.Kafka, "user-events", log)
  go cons.Consume(ctx, handleUserEvent)
  ```

## WebSocket & SSE

- WebSocket: `internal/delivery/websocket/Hub` — `hub.GinHandler()` returns `gin.HandlerFunc`
  - Call `hub.Broadcast([]byte)` from anywhere to push to all clients
- SSE: `internal/delivery/sse/Broker` — `broker.GinHandler()` returns `gin.HandlerFunc`
  - Call `broker.Publish(sse.Event{Event: "update", Data: "..."})` to stream to all clients
- Both run a goroutine loop via `.Run(ctx)` started in `app.go`

## Existing Domains

### User (`internal/domain/entity/user.go`)
- Fields: ID, Email, FirstName, LastName, Avatar, Birthday, Password, GoogleID, Role, CreatedAt, UpdatedAt
- Input DTOs: `CreateUserInput`, `UpdateUserInput`
- CRUD routes: `/api/v1/users` (protected by Auth middleware)

### Product (`internal/domain/entity/product.go`)
- Fields: ID, Name, Quantity, Price, CreatedAt, UpdatedAt
- Input DTOs: `CreateProductInput`, `UpdateProductInput`
- CRUD routes: `/api/v1/products` (protected by Auth middleware)

### Auth (`internal/domain/entity/auth.go`)
- DTOs: `TokenPair`, `RegisterInput`, `LoginInput`, `RefreshInput`, `GoogleUserInfo`
- Routes: `/api/v1/auth/*`

## Production Checklist

- [ ] Set `JWT_SECRET` env var (not the placeholder default)
- [ ] Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` env vars
- [ ] Set `cors.allowed_origins` to your frontend domain(s)
- [ ] Enable Redis (`features.redis.enabled: true`) for token blacklist + cache
- [ ] Ensure PostgreSQL is running and accessible
- [ ] Set `app.env: production` — triggers config validation and disables debug mode
- [ ] Use HTTPS in production — update Google redirect URL and set Secure flag on cookies
