package main

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func connectMongo(ctx context.Context, uri, dbName string) (*mongo.Database, error) {
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}
	pingCtx, cancel := context.WithTimeout(ctx, 8*time.Second)
	defer cancel()
	if err := client.Ping(pingCtx, nil); err != nil {
		return nil, fmt.Errorf("mongodb ping: %w", err)
	}
	db := client.Database(dbName)
	if err := ensureIndexes(ctx, db); err != nil {
		return nil, err
	}
	return db, nil
}

func ensureIndexes(ctx context.Context, db *mongo.Database) error {
	_, err := db.Collection("users").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "email", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return err
	}
	_, err = db.Collection("votes").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{
			{Key: "pollId", Value: 1},
			{Key: "voterKey", Value: 1},
		},
		Options: options.Index().SetUnique(true),
	})
	return err
}
