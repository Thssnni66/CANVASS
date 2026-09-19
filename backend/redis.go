package main

import (
	"context"
	"fmt"
	"strconv"

	"github.com/redis/go-redis/v9"
)

func connectRedis(ctx context.Context, addr string) (*redis.Client, error) {
	rdb := redis.NewClient(&redis.Options{Addr: addr})
	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("redis ping: %w", err)
	}
	return rdb, nil
}

func countsKey(pollID string) string {
	return "poll:" + pollID + ":counts"
}

func channelKey(pollID string) string {
	return "poll:" + pollID
}

func initPollCounts(ctx context.Context, rdb *redis.Client, pollID string, optionIDs []string) error {
	pipe := rdb.Pipeline()
	for _, id := range optionIDs {
		pipe.HSet(ctx, countsKey(pollID), id, 0)
	}
	_, err := pipe.Exec(ctx)
	return err
}

func incrOptionCount(ctx context.Context, rdb *redis.Client, pollID, optionID string) (map[string]int, error) {
	if err := rdb.HIncrBy(ctx, countsKey(pollID), optionID, 1).Err(); err != nil {
		return nil, err
	}
	return readCounts(ctx, rdb, pollID)
}

func readCounts(ctx context.Context, rdb *redis.Client, pollID string) (map[string]int, error) {
	raw, err := rdb.HGetAll(ctx, countsKey(pollID)).Result()
	if err != nil {
		return nil, err
	}
	out := make(map[string]int, len(raw))
	for k, v := range raw {
		n, _ := strconv.Atoi(v)
		out[k] = n
	}
	return out, nil
}
