package logger

import (
	"io"
	"os"
	"strings"

	"github.com/rs/zerolog"
	"github.com/your-org/go-template/config"
)

type Logger struct {
	zerolog.Logger
}

func New(cfg config.LoggerConfig) *Logger {
	var level zerolog.Level
	switch strings.ToLower(cfg.Level) {
	case "debug":
		level = zerolog.DebugLevel
	case "info":
		level = zerolog.InfoLevel
	case "warn":
		level = zerolog.WarnLevel
	case "error":
		level = zerolog.ErrorLevel
	default:
		level = zerolog.InfoLevel
	}

	var writer io.Writer
	switch strings.ToLower(cfg.Output) {
	case "file":
		f, err := os.OpenFile(cfg.FilePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o666)
		if err != nil {
			writer = os.Stdout
		} else {
			writer = f
		}
	default:
		writer = os.Stdout
	}

	if cfg.Format == "text" {
		writer = zerolog.ConsoleWriter{Out: writer}
	}

	l := zerolog.New(writer).Level(level).With().Timestamp().Caller().Logger()
	return &Logger{l}
}

func (l *Logger) WithComponent(component string) *Logger {
	child := l.With().Str("component", component).Logger()
	return &Logger{child}
}
