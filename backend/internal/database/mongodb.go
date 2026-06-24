package database

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/Piyush-Singh-coder/horizon-golang/internal/config"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.mongodb.org/mongo-driver/v2/mongo/readpref"
)

// DBClient holds the MongoDB client and configuration context.
type DBClient struct {
	Client *mongo.Client
	DBName string
}

// ConnectDB establishes a connection to MongoDB and pings the database.
func ConnectDB(cfg *config.Config) (*DBClient, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(cfg.MongoTimeoutSeconds)*time.Second)
	defer cancel()

	slog.Info("Connecting to MongoDB...", "uri", cfg.MongoURI)

	// In Mongo Go Driver v2, options.Client().ApplyURI parses the string
	clientOpts := options.Client().ApplyURI(cfg.MongoURI)

	client, err := mongo.Connect(clientOpts)
	if err != nil {
		return nil, fmt.Errorf("failed to create mongodb client: %w", err)
	}

	// Ping connection to verify it's open
	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		return nil, fmt.Errorf("failed to ping mongodb: %w", err)
	}

	slog.Info("Successfully connected to MongoDB!", "database", cfg.MongoDBName)

	return &DBClient{
		Client: client,
		DBName: cfg.MongoDBName,
	}, nil
}

// Database returns the database instance.
func (db *DBClient) Database() *mongo.Database {
	return db.Client.Database(db.DBName)
}

// Collection returns a handle for a given collection in the database.
func (db *DBClient) Collection(name string) *mongo.Collection {
	return db.Database().Collection(name)
}

// Disconnect closes the MongoDB connection gracefully.
func (db *DBClient) Disconnect() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	slog.Info("Disconnecting from MongoDB...")
	return db.Client.Disconnect(ctx)
}
