package database

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/Piyush-Singh-coder/horizon-golang/internal/config"

	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

type DynamoClient struct {
	Client *dynamodb.Client
	Cfg    *config.Config
}

func ConnectDynamoDB(cfg *config.Config) (*DynamoClient, error) {
	if cfg.AWSAccessKeyID == "" || cfg.AWSSecretAccessKey == "" {
		return nil, fmt.Errorf("AWS credentials are missing in environment")
	}

	creds := credentials.NewStaticCredentialsProvider(cfg.AWSAccessKeyID, cfg.AWSSecretAccessKey, "")
	awsCfg, err := awsconfig.LoadDefaultConfig(
		context.TODO(),
		awsconfig.WithRegion(cfg.AWSRegion),
		awsconfig.WithCredentialsProvider(creds),
	)

	if err != nil {
		return nil, fmt.Errorf("failed to load AWS configuration for DynamoDB: %w", err)
	}

	client := dynamodb.NewFromConfig(awsCfg)
	slog.Info("Successfully initialized AWS DynamoDB client!", "region", cfg.AWSRegion)

	return &DynamoClient{
		Client: client,
		Cfg:    cfg,
	}, nil
}
