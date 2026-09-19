package main

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Option struct {
	ID   string `bson:"id" json:"id"`
	Text string `bson:"text" json:"text"`
}

type Poll struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Question  string             `bson:"question" json:"question"`
	Options   []Option           `bson:"options" json:"options"`
	CreatedBy string             `bson:"createdBy" json:"createdBy"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}

type Vote struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	PollID    primitive.ObjectID `bson:"pollId" json:"pollId"`
	OptionID  string             `bson:"optionId" json:"optionId"`
	VoterKey  string             `bson:"voterKey" json:"voterKey"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}

type createPollBody struct {
	Question string   `json:"question"`
	Options  []string `json:"options"`
}

type voteBody struct {
	OptionID string `json:"optionId"`
	VoterKey string `json:"voterKey"`
}

type pollResponse struct {
	ID        string         `json:"id"`
	Question  string         `json:"question"`
	Options   []Option       `json:"options"`
	Counts    map[string]int `json:"counts"`
	CreatedBy string         `json:"createdBy"`
	CreatedAt time.Time      `json:"createdAt"`
}

func (a *App) createPoll(c *gin.Context) {
	var body createPollBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json"})
		return
	}
	question := strings.TrimSpace(body.Question)
	opts := cleanOptions(body.Options)
	if question == "" || len(opts) < 2 || len(opts) > 6 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "question and 2–6 options required"})
		return
	}
	userID := c.GetString("userId")
	poll := Poll{
		Question:  question,
		Options:   opts,
		CreatedBy: userID,
		CreatedAt: time.Now().UTC(),
	}
	ctx, cancel := context.WithTimeout(c.Request.Context(), 8*time.Second)
	defer cancel()
	res, err := a.db.Collection("polls").InsertOne(ctx, poll)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create poll"})
		return
	}
	id := res.InsertedID.(primitive.ObjectID)
	poll.ID = id
	ids := make([]string, len(opts))
	for i, o := range opts {
		ids[i] = o.ID
	}
	if err := initPollCounts(ctx, a.rdb, id.Hex(), ids); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not init live counts"})
		return
	}
	c.JSON(http.StatusCreated, a.toPollResponse(ctx, poll))
}

func (a *App) getPoll(c *gin.Context) {
	poll, err := a.findPoll(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "poll not found"})
		return
	}
	c.JSON(http.StatusOK, a.toPollResponse(c.Request.Context(), poll))
}

func (a *App) vote(c *gin.Context) {
	var body voteBody
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json"})
		return
	}
	voterKey := strings.TrimSpace(body.VoterKey)
	if voterKey == "" {
		voterKey = strings.TrimSpace(c.GetHeader("X-Voter-Key"))
	}
	if voterKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "voterKey required"})
		return
	}
	poll, err := a.findPoll(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "poll not found"})
		return
	}
	if !hasOption(poll, body.OptionID) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid option"})
		return
	}
	ctx, cancel := context.WithTimeout(c.Request.Context(), 8*time.Second)
	defer cancel()
	_, err = a.db.Collection("votes").InsertOne(ctx, Vote{
		PollID:    poll.ID,
		OptionID:  body.OptionID,
		VoterKey:  voterKey,
		CreatedAt: time.Now().UTC(),
	})
	if mongoDup(err) {
		c.JSON(http.StatusConflict, gin.H{"error": "already voted"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not save vote"})
		return
	}
	counts, err := incrOptionCount(ctx, a.rdb, poll.ID.Hex(), body.OptionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update live counts"})
		return
	}
	payload, _ := json.Marshal(gin.H{
		"optionId": body.OptionID,
		"counts":   counts,
	})
	if err := a.rdb.Publish(ctx, channelKey(poll.ID.Hex()), payload).Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not publish live update"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true, "counts": counts})
}

func (a *App) findPoll(ctx context.Context, id string) (Poll, error) {
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return Poll{}, err
	}
	qctx, cancel := context.WithTimeout(ctx, 8*time.Second)
	defer cancel()
	var poll Poll
	err = a.db.Collection("polls").FindOne(qctx, bson.M{"_id": oid}).Decode(&poll)
	return poll, err
}

func (a *App) toPollResponse(ctx context.Context, poll Poll) pollResponse {
	counts, err := readCounts(ctx, a.rdb, poll.ID.Hex())
	if err != nil || len(counts) == 0 {
		counts = countsFromMongo(ctx, a.db, poll)
	}
	return pollResponse{
		ID:        poll.ID.Hex(),
		Question:  poll.Question,
		Options:   poll.Options,
		Counts:    counts,
		CreatedBy: poll.CreatedBy,
		CreatedAt: poll.CreatedAt,
	}
}

func countsFromMongo(ctx context.Context, db *mongo.Database, poll Poll) map[string]int {
	out := map[string]int{}
	for _, o := range poll.Options {
		out[o.ID] = 0
	}
	qctx, cancel := context.WithTimeout(ctx, 8*time.Second)
	defer cancel()
	cur, err := db.Collection("votes").Find(qctx, bson.M{"pollId": poll.ID})
	if err != nil {
		return out
	}
	defer cur.Close(qctx)
	for cur.Next(qctx) {
		var v Vote
		if cur.Decode(&v) == nil {
			out[v.OptionID]++
		}
	}
	return out
}

func cleanOptions(raw []string) []Option {
	var opts []Option
	for _, s := range raw {
		t := strings.TrimSpace(s)
		if t == "" {
			continue
		}
		opts = append(opts, Option{
			ID:   primitive.NewObjectID().Hex(),
			Text: t,
		})
	}
	return opts
}

func hasOption(poll Poll, optionID string) bool {
	for _, o := range poll.Options {
		if o.ID == optionID {
			return true
		}
	}
	return false
}

func mongoDup(err error) bool {
	if err == nil {
		return false
	}
	var we mongo.WriteException
	if errors.As(err, &we) {
		for _, e := range we.WriteErrors {
			if e.Code == 11000 {
				return true
			}
		}
	}
	return mongo.IsDuplicateKeyError(err)
}
