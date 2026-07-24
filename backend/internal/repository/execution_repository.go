package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/Piyush-Singh-coder/horizon-golang/internal/database"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/model"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type ExecutionRepository struct {
	MongoDB   *database.DBClient
	DynamoDB  *database.DynamoClient
	TableName string
	IsDynamo  bool
}

func NewExecutionRepository(mongoDB *database.DBClient, dynamoDB *database.DynamoClient, isDynamo bool) *ExecutionRepository {
	return &ExecutionRepository{
		MongoDB:   mongoDB,
		DynamoDB:  dynamoDB,
		TableName: "horizon-executions",
		IsDynamo:  isDynamo,
	}
}

type ExecutionDynamoModel struct {
	ID        string `dynamodbav:"id"`
	UserID    string `dynamodbav:"userId"`
	Language  string `dynamodbav:"language"`
	Code      string `dynamodbav:"code"`
	Input     string `dynamodbav:"input"`
	Output    string `dynamodbav:"output"`
	Error     string `dynamodbav:"error"`
	Status    string `dynamodbav:"status"`
	ExitCode  int    `dynamodbav:"exitCode"`
	CreatedAt string `dynamodbav:"createdAt"`
}

func (r *ExecutionRepository) SaveExecution(ctx context.Context, exec *model.Execution) error {
	if r.IsDynamo {
		if exec.ID.IsZero() {
			exec.ID = bson.NewObjectID()
		}
		now := time.Now().Format(time.RFC3339)

		item := ExecutionDynamoModel{
			ID:        exec.ID.Hex(),
			UserID:    exec.User.Hex(),
			Language:  exec.Language,
			Code:      exec.Code,
			Output:    exec.Output,
			CreatedAt: now,
		}

		av, err := attributevalue.MarshalMap(item)
		if err != nil {
			return fmt.Errorf("failed to marshal execution: %w", err)
		}

		_, err = r.DynamoDB.Client.PutItem(ctx, &dynamodb.PutItemInput{
			TableName: aws.String(r.TableName),
			Item:      av,
		})
		return err
	}

	// MongoDB Fallback
	execCol := r.MongoDB.Collection("executions")
	exec.CreatedAt = time.Now()
	_, err := execCol.InsertOne(ctx, exec)
	return err
}

func (r *ExecutionRepository) GetExecutionsByUserID(ctx context.Context, userIDHex string) ([]model.Execution, error) {
	if r.IsDynamo {
		out, err := r.DynamoDB.Client.Scan(ctx, &dynamodb.ScanInput{
			TableName:        aws.String(r.TableName),
			FilterExpression: aws.String("userId = :uid"),
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":uid": &types.AttributeValueMemberS{Value: userIDHex},
			},
		})

		if err != nil {
			return nil, err
		}

		var items []ExecutionDynamoModel
		if err := attributevalue.UnmarshalListOfMaps(out.Items, &items); err != nil {
			return nil, err
		}

		executions := make([]model.Execution, len(items))
		for i, item := range items {
			oid, _ := bson.ObjectIDFromHex(item.ID)
			uoid, _ := bson.ObjectIDFromHex(item.UserID)
			createdAt, _ := time.Parse(time.RFC3339, item.CreatedAt)

			executions[i] = model.Execution{
				ID:        oid,
				User:      uoid,
				Language:  item.Language,
				Code:      item.Code,
				Output:    item.Output,
				CreatedAt: createdAt,
			}
		}

		return executions, nil
	}

	// MongoDB Fallback
	uoid, err := bson.ObjectIDFromHex(userIDHex)
	if err != nil {
		return nil, err
	}
	execCol := r.MongoDB.Collection("executions")
	cursor, err := execCol.Find(ctx, bson.M{"userId": uoid})
	if err != nil {
		return nil, err
	}
	var executions []model.Execution
	if err := cursor.All(ctx, &executions); err != nil {
		return nil, err
	}
	return executions, nil
}

func (r *ExecutionRepository) DeleteExecution(ctx context.Context, execIDHex string, userIDHex string) error {
	if r.IsDynamo {
		_, err := r.DynamoDB.Client.DeleteItem(ctx, &dynamodb.DeleteItemInput{
			TableName: aws.String(r.TableName),
			Key: map[string]types.AttributeValue{
				"id":     &types.AttributeValueMemberS{Value: execIDHex},
				"userId": &types.AttributeValueMemberS{Value: userIDHex},
			},
		})
		return err
	}

	// MongoDB Fallback
	eoid, err := bson.ObjectIDFromHex(execIDHex)
	if err != nil {
		return err
	}
	uoid, err := bson.ObjectIDFromHex(userIDHex)
	if err != nil {
		return err
	}
	execCol := r.MongoDB.Collection("executions")
	_, err = execCol.DeleteOne(ctx, bson.M{"_id": eoid, "userId": uoid})
	return err
}
