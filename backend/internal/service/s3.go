package service

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"path/filepath"
	"time"

	"github.com/Piyush-Singh-coder/horizon-golang/internal/config"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type S3Service struct {
	client     *s3.Client
	bucketName string
	region     string
}

func NewS3Service(cfg *config.Config) *S3Service {
	if cfg.AWSAccessKeyID == "" || cfg.AWSSecretAccessKey == "" || cfg.AWSS3BucketName == "" {
		slog.Warn("AWS S3 credentials or bucket name not set. S3 uploads will be disabled.")
		return &S3Service{
			bucketName: cfg.AWSS3BucketName,
			region:     cfg.AWSRegion,
		}
	}

	creds := credentials.NewStaticCredentialsProvider(cfg.AWSAccessKeyID, cfg.AWSSecretAccessKey, "")
	awsCfg, err := awsconfig.LoadDefaultConfig(
		context.TODO(),
		awsconfig.WithRegion(cfg.AWSRegion),
		awsconfig.WithCredentialsProvider(creds),
	)

	if err != nil {
		slog.Error("failed to load AWS config", "error", err)
		return &S3Service{
			bucketName: cfg.AWSS3BucketName,
			region:     cfg.AWSRegion,
		}
	}

	client := s3.NewFromConfig(awsCfg)
	return &S3Service{
		client:     client,
		bucketName: cfg.AWSS3BucketName,
		region:     cfg.AWSRegion,
	}
}

func (s *S3Service) UploadAvatar(ctx context.Context, userID string, file io.Reader, filename string, contentType string) (string, error) {
	if s.client == nil || s.bucketName == "" {
		return "", fmt.Errorf("AWS S3 is not configured. Please add AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET_NAME to your .env file")
	}

	ext := filepath.Ext(filename)
	if ext == "" {
		ext = ".png"
	}

	// Key path: avatars/{userID}-{timestamp}{ext}
	key := fmt.Sprintf("avatars/%s-%d%s", userID, time.Now().Unix(), ext)

	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucketName),
		Key:         aws.String(key),
		Body:        file,
		ContentType: aws.String(contentType),
	})

	if err != nil {
		return "", fmt.Errorf("failed to upload object to S3: %w", err)
	}

	// Public S3 URL format
	url := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", s.bucketName, s.region, key)
	return url, nil
}
