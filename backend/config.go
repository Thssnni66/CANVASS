package main

import (
	"bufio"
	"os"
	"strings"
)

func loadDotEnv() {
	f, err := os.Open(".env")
	if err != nil {
		return
	}
	defer f.Close()
	s := bufio.NewScanner(f)
	for s.Scan() {
		line := strings.TrimSpace(s.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		k, v, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		k = strings.TrimSpace(k)
		v = strings.TrimSpace(v)
		if os.Getenv(k) == "" {
			_ = os.Setenv(k, v)
		}
	}
}

type Config struct {
	Port      string
	MongoURI  string
	MongoDB   string
	RedisAddr string
	JWTSecret string
}

func loadConfig() Config {
	loadDotEnv()
	return Config{
		Port:      env("PORT", "8080"),
		MongoURI:  env("MONGO_URI", "mongodb://localhost:27017"),
		MongoDB:   env("MONGO_DB", "live_poll_app"),
		RedisAddr: env("REDIS_ADDR", "localhost:6379"),
		JWTSecret: env("JWT_SECRET", "change-this-dev-secret"),
	}
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
