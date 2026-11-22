package events

import (
	"context"
	"fmt"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
)

type NATSClient struct {
	Conn *nats.Conn
	JS   jetstream.JetStream
}

func NewNATSClient(natsURL string) (*NATSClient, error) {
	nc, err := nats.Connect(natsURL,
		nats.Timeout(5*time.Second),
		nats.ReconnectWait(1*time.Second),
		nats.MaxReconnects(10),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to nats: %w", err)
	}

	js, err := jetstream.New(nc)
	if err != nil {
		nc.Close()
		return nil, fmt.Errorf("failed to initialize jetstream context: %w", err)
	}

	return &NATSClient{
		Conn: nc,
		JS:   js,
	}, nil
}

func (c *NATSClient) Ping(ctx context.Context) error {
	if c.Conn == nil || !c.Conn.IsConnected() {
		return fmt.Errorf("nats connection is closed or disconnected")
	}
	return nil
}

func (c *NATSClient) Close() {
	if c.Conn != nil {
		c.Conn.Close()
	}
}
