package main

import (
	"context"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/mongo"
)

type App struct {
	cfg Config
	db  *mongo.Database
	rdb *redis.Client
}

func main() {
	cfg := loadConfig()

	ctx, cancel := context.WithTimeout(
		context.Background(),
		15*time.Second,
	)
	defer cancel()

	db, err := connectMongo(ctx, cfg.MongoURI, cfg.MongoDB)
	if err != nil {
		log.Fatalf("mongo: %v", err)
	}

	rdb, err := connectRedis(ctx, cfg.RedisAddr)
	if err != nil {
		log.Fatalf("redis: %v", err)
	}

	app := &App{
		cfg: cfg,
		db:  db,
		rdb: rdb,
	}

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"https://YOUR-VERCEL-URL.vercel.app",
		},
		AllowMethods: []string{
			"GET",
			"POST",
			"OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Authorization",
			"X-Voter-Key",
		},
		ExposeHeaders: []string{
			"Content-Type",
		},
		AllowCredentials: true,
	}))

	api := r.Group("/api")

	api.POST("/auth/signup", app.signup)
	api.POST("/auth/login", app.login)

	api.GET("/polls/:id", app.getPoll)
	api.POST("/polls/:id/vote", app.vote)
	api.GET("/polls/:id/stream", app.streamPoll)

	api.POST(
		"/polls",
		app.requireAuth(),
		app.createPoll,
	)

	log.Printf("listening on :%s", cfg.Port)

	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
