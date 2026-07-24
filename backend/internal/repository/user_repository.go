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

type UserRepository struct {
	MongoDB   *database.DBClient
	DynamoDB  *database.DynamoClient
	TableName string
	IsDynamo  bool
}

func NewUserRepository(mongoDB *database.DBClient, dynamoDB *database.DynamoClient, isDynamo bool) *UserRepository {
	return &UserRepository{
		MongoDB:   mongoDB,
		DynamoDB:  dynamoDB,
		TableName: "horizon-users",
		IsDynamo:  isDynamo,
	}
}

// UserDynamoModel represents the DynamoDB item structure for User
type UserDynamoModel struct {
	ID           string `dynamodbav:"id"`
	FullName     string `dynamodbav:"fullName"`
	Email        string `dynamodbav:"email"`
	Password     string `dynamodbav:"password,omitempty"`
	AuthProvider string `dynamodbav:"authProvider"`
	AvatarURL    string `dynamodbav:"avatarUrl,omitempty"`
	IsVerified   bool   `dynamodbav:"isVerified"`
	CreatedAt    string `dynamodbav:"createdAt"`
	UpdatedAt    string `dynamodbav:"updatedAt"`
}

func (r *UserRepository) CreateUser(ctx context.Context, u *model.User) error {
	if r.IsDynamo {
		if u.ID.IsZero() {
			u.ID = bson.NewObjectID()
		}
		now := time.Now().Format(time.RFC3339)

		item := UserDynamoModel{
			ID:           u.ID.Hex(),
			FullName:     u.FullName,
			Email:        u.Email,
			Password:     u.Password,
			AuthProvider: u.AuthProvider,
			AvatarURL:    u.AvatarURL,
			IsVerified:   u.IsVerified,
			CreatedAt:    now,
			UpdatedAt:    now,
		}

		av, err := attributevalue.MarshalMap(item)
		if err != nil {
			return fmt.Errorf("failed to marshal user for DynamoDB: %w", err)
		}

		_, err = r.DynamoDB.Client.PutItem(ctx, &dynamodb.PutItemInput{
			TableName: aws.String(r.TableName),
			Item:      av,
		})
		if err != nil {
			return fmt.Errorf("failed to put user in DynamoDB: %w", err)
		}

		return nil
	}

	// MongoDB Fallback
	usersCol := r.MongoDB.Collection("users")
	u.CreatedAt = time.Now()
	u.UpdatedAt = time.Now()
	res, err := usersCol.InsertOne(ctx, u)
	if err != nil {
		return err
	}
	if oid, ok := res.InsertedID.(bson.ObjectID); ok {
		u.ID = oid
	}
	return nil
}

func (r *UserRepository) GetUserByEmail(ctx context.Context, email string) (*model.User, error) {
	if r.IsDynamo {
		out, err := r.DynamoDB.Client.Scan(ctx, &dynamodb.ScanInput{
			TableName:        aws.String(r.TableName),
			FilterExpression: aws.String("email = :email"),
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":email": &types.AttributeValueMemberS{Value: email},
			},
		})

		if err != nil {
			return nil, fmt.Errorf("failed to query user by email in DynamoDB: %w", err)
		}

		if len(out.Items) == 0 {
			return nil, nil
		}

		var item UserDynamoModel
		if err := attributevalue.UnmarshalMap(out.Items[0], &item); err != nil {
			return nil, fmt.Errorf("failed to unmarshal user item: %w", err)
		}

		oid, _ := bson.ObjectIDFromHex(item.ID)
		createdAt, _ := time.Parse(time.RFC3339, item.CreatedAt)
		updatedAt, _ := time.Parse(time.RFC3339, item.UpdatedAt)

		return &model.User{
			ID:           oid,
			FullName:     item.FullName,
			Email:        item.Email,
			Password:     item.Password,
			AuthProvider: item.AuthProvider,
			AvatarURL:    item.AvatarURL,
			IsVerified:   item.IsVerified,
			CreatedAt:    createdAt,
			UpdatedAt:    updatedAt,
		}, nil
	}

	// MongoDB Fallback
	usersCol := r.MongoDB.Collection("users")
	var user model.User
	err := usersCol.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		return nil, nil
	}
	return &user, nil
}

func (r *UserRepository) GetUserByID(ctx context.Context, idHex string) (*model.User, error) {
	if r.IsDynamo {
		out, err := r.DynamoDB.Client.GetItem(ctx, &dynamodb.GetItemInput{
			TableName: aws.String(r.TableName),
			Key: map[string]types.AttributeValue{
				"id": &types.AttributeValueMemberS{Value: idHex},
			},
		})

		if err != nil || len(out.Item) == 0 {
			return nil, err
		}

		var item UserDynamoModel
		if err := attributevalue.UnmarshalMap(out.Item, &item); err != nil {
			return nil, err
		}

		oid, _ := bson.ObjectIDFromHex(item.ID)
		createdAt, _ := time.Parse(time.RFC3339, item.CreatedAt)
		updatedAt, _ := time.Parse(time.RFC3339, item.UpdatedAt)

		return &model.User{
			ID:           oid,
			FullName:     item.FullName,
			Email:        item.Email,
			Password:     item.Password,
			AuthProvider: item.AuthProvider,
			AvatarURL:    item.AvatarURL,
			IsVerified:   item.IsVerified,
			CreatedAt:    createdAt,
			UpdatedAt:    updatedAt,
		}, nil
	}

	// MongoDB Fallback
	oid, err := bson.ObjectIDFromHex(idHex)
	if err != nil {
		return nil, err
	}
	usersCol := r.MongoDB.Collection("users")
	var user model.User
	err = usersCol.FindOne(ctx, bson.M{"_id": oid}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) UpdateAvatar(ctx context.Context, idHex string, avatarURL string) error {
	if r.IsDynamo {
		now := time.Now().Format(time.RFC3339)
		_, err := r.DynamoDB.Client.UpdateItem(ctx, &dynamodb.UpdateItemInput{
			TableName: aws.String(r.TableName),
			Key: map[string]types.AttributeValue{
				"id": &types.AttributeValueMemberS{Value: idHex},
			},
			UpdateExpression: aws.String("SET avatarUrl = :a, updatedAt = :u"),
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":a": &types.AttributeValueMemberS{Value: avatarURL},
				":u": &types.AttributeValueMemberS{Value: now},
			},
		})
		return err
	}

	// MongoDB Fallback
	oid, err := bson.ObjectIDFromHex(idHex)
	if err != nil {
		return err
	}
	usersCol := r.MongoDB.Collection("users")
	_, err = usersCol.UpdateOne(ctx, bson.M{"_id": oid}, bson.M{"$set": bson.M{"avatarUrl": avatarURL, "updatedAt": time.Now()}})
	return err
}

func (r *UserRepository) VerifyUserEmail(ctx context.Context, idHex string) error {
	if r.IsDynamo {
		now := time.Now().Format(time.RFC3339)
		_, err := r.DynamoDB.Client.UpdateItem(ctx, &dynamodb.UpdateItemInput{
			TableName: aws.String(r.TableName),
			Key: map[string]types.AttributeValue{
				"id": &types.AttributeValueMemberS{Value: idHex},
			},
			UpdateExpression: aws.String("SET isVerified = :v, updatedAt = :u"),
			ExpressionAttributeValues: map[string]types.AttributeValue{
				":v": &types.AttributeValueMemberBOOL{Value: true},
				":u": &types.AttributeValueMemberS{Value: now},
			},
		})
		return err
	}

	// MongoDB Fallback
	oid, err := bson.ObjectIDFromHex(idHex)
	if err != nil {
		return err
	}
	usersCol := r.MongoDB.Collection("users")
	_, err = usersCol.UpdateOne(ctx, bson.M{"_id": oid}, bson.M{"$set": bson.M{"isVerified": true, "updatedAt": time.Now()}})
	return err
}
