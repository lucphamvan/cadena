package config

import (
	"errors"
	"fmt"
	"os"
	"time"

	"gopkg.in/yaml.v3"
)

type Config struct {
	App      AppConfig      `yaml:"app"`
	Server   ServerConfig   `yaml:"server"`
	CORS     CORSConfig     `yaml:"cors"`
	Features FeaturesConfig `yaml:"features"`
	Postgres PostgresConfig `yaml:"postgres"`
	Redis    RedisConfig    `yaml:"redis"`
	Logger   LoggerConfig   `yaml:"logger"`
	JWT      JWTConfig      `yaml:"jwt"`
	Employee EmployeeConfig `yaml:"employee"`
}

type AppConfig struct {
	Name    string `yaml:"name"`
	Version string `yaml:"version"`
	Env     string `yaml:"env"`
}

type ServerConfig struct {
	HTTP HTTPConfig `yaml:"http"`
}

type HTTPConfig struct {
	Host            string        `yaml:"host"`
	Port            int           `yaml:"port"`
	ReadTimeout     time.Duration `yaml:"read_timeout"`
	WriteTimeout    time.Duration `yaml:"write_timeout"`
	IdleTimeout     time.Duration `yaml:"idle_timeout"`
	ShutdownTimeout time.Duration `yaml:"shutdown_timeout"`
}

func (h HTTPConfig) Address() string {
	return fmt.Sprintf("%s:%d", h.Host, h.Port)
}

type FeaturesConfig struct {
	Postgres FeatureToggle `yaml:"postgres"`
	Redis    FeatureToggle `yaml:"redis"`
}

type CORSConfig struct {
	AllowedOrigins []string `yaml:"allowed_origins"`
}

type FeatureToggle struct {
	Enabled bool `yaml:"enabled"`
}

type PostgresConfig struct {
	Host            string        `yaml:"host"`
	Port            int           `yaml:"port"`
	User            string        `yaml:"user"`
	Password        string        `yaml:"password"`
	DBName          string        `yaml:"dbname"`
	SSLMode         string        `yaml:"sslmode"`
	MaxOpenConns    int           `yaml:"max_open_conns"`
	MaxIdleConns    int           `yaml:"max_idle_conns"`
	ConnMaxLifetime time.Duration `yaml:"conn_max_lifetime"`
}

func (p PostgresConfig) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		p.Host, p.Port, p.User, p.Password, p.DBName, p.SSLMode,
	)
}

type RedisConfig struct {
	Host         string        `yaml:"host"`
	Port         int           `yaml:"port"`
	Password     string        `yaml:"password"`
	DB           int           `yaml:"db"`
	PoolSize     int           `yaml:"pool_size"`
	MinIdleConns int           `yaml:"min_idle_conns"`
	DialTimeout  time.Duration `yaml:"dial_timeout"`
	ReadTimeout  time.Duration `yaml:"read_timeout"`
	WriteTimeout time.Duration `yaml:"write_timeout"`
}

func (r RedisConfig) Address() string {
	return fmt.Sprintf("%s:%d", r.Host, r.Port)
}

type LoggerConfig struct {
	Level    string `yaml:"level"`
	Format   string `yaml:"format"`
	Output   string `yaml:"output"`
	FilePath string `yaml:"file_path"`
}

type JWTConfig struct {
	Secret             string        `yaml:"secret"`
	AccessTokenExpiry  time.Duration `yaml:"access_token_expiry"`
	RefreshTokenExpiry time.Duration `yaml:"refresh_token_expiry"`
}

// EmployeeConfig holds employee portal specific configuration.
type EmployeeConfig struct {
	SkillOptions    []string `yaml:"skill_options"`
	ChangeHistoryDays int    `yaml:"change_history_days"`
}

func Load(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("config: read file: %w", err)
	}

	expanded := os.ExpandEnv(string(data))

	cfg := &Config{}
	if err := yaml.Unmarshal([]byte(expanded), cfg); err != nil {
		return nil, fmt.Errorf("config: unmarshal: %w", err)
	}

	cfg.setDefaults()
	return cfg, nil
}

func (c *Config) setDefaults() {
	if c.Server.HTTP.Port == 0 {
		c.Server.HTTP.Port = 8080
	}
	if c.Server.HTTP.ReadTimeout == 0 {
		c.Server.HTTP.ReadTimeout = 10 * time.Second
	}
	if c.Server.HTTP.WriteTimeout == 0 {
		c.Server.HTTP.WriteTimeout = 10 * time.Second
	}
	if c.Server.HTTP.IdleTimeout == 0 {
		c.Server.HTTP.IdleTimeout = 120 * time.Second
	}
	if c.Server.HTTP.ShutdownTimeout == 0 {
		c.Server.HTTP.ShutdownTimeout = 10 * time.Second
	}
	if c.Logger.Level == "" {
		c.Logger.Level = "info"
	}
	if c.Logger.Format == "" {
		c.Logger.Format = "json"
	}
	if len(c.CORS.AllowedOrigins) == 0 {
		c.CORS.AllowedOrigins = []string{"*"}
	}
	if c.JWT.AccessTokenExpiry == 0 {
		c.JWT.AccessTokenExpiry = 15 * time.Minute
	}
	if c.JWT.RefreshTokenExpiry == 0 {
		c.JWT.RefreshTokenExpiry = 168 * time.Hour
	}
	if c.Employee.ChangeHistoryDays == 0 {
		c.Employee.ChangeHistoryDays = 7
	}
	if len(c.Employee.SkillOptions) == 0 {
		c.Employee.SkillOptions = []string{"Go", "React", "Flutter", "CI/CD"}
	}
}

func (c *Config) Validate() error {
	var errs []error

	if c.JWT.Secret == "" {
		errs = append(errs, fmt.Errorf("jwt.secret must not be empty"))
	}
	const defaultSecret = "your-super-secret-key-change-in-production"
	if c.App.Env == "production" && c.JWT.Secret == defaultSecret {
		errs = append(errs, fmt.Errorf("jwt.secret is still the default placeholder — change it before deploying"))
	}

	return errors.Join(errs...)
}
