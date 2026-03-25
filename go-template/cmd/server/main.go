package main

import (
	"flag"
	"log"

	"github.com/joho/godotenv"
	"github.com/your-org/go-template/config"
	"github.com/your-org/go-template/internal/app"
)

func main() {
	// Load .env file nếu tồn tại (khi chạy ngoài Docker).
	// Trong Docker, biến môi trường đã được inject qua env_file nên không cần file này.
	_ = godotenv.Load()

	configPath := flag.String("config", "config/config.yaml", "path to config file")
	flag.Parse()

	cfg, err := config.Load(*configPath)
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	application := app.New(cfg)
	if err := application.Run(); err != nil {
		log.Fatalf("application error: %v", err)
	}
}
