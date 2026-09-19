package main

import (
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (a *App) streamPoll(c *gin.Context) {
	id := c.Param("id")
	if _, err := a.findPoll(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "poll not found"})
		return
	}

	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("X-Accel-Buffering", "no")
	c.Status(http.StatusOK)
	c.Writer.Flush()

	ctx := c.Request.Context()
	pubsub := a.rdb.Subscribe(ctx, channelKey(id))
	defer pubsub.Close()

	ch := pubsub.Channel()
	fmt.Fprintf(c.Writer, "event: hello\ndata: {}\n\n")
	c.Writer.Flush()

	for {
		select {
		case <-ctx.Done():
			return
		case msg, ok := <-ch:
			if !ok {
				return
			}
			if _, err := io.WriteString(c.Writer, "event: vote\ndata: "+msg.Payload+"\n\n"); err != nil {
				return
			}
			c.Writer.Flush()
		}
	}
}
