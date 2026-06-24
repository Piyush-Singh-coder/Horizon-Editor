package model

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Comment struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"_id"`
	User      bson.ObjectID `bson:"user" json:"user"`
	Text      string        `bson:"text" json:"text"`
	CreatedAt time.Time     `bson:"createdAt,omitempty" json:"createdAt,omitempty"`
	UpdatedAt time.Time     `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
}

type Snippet struct {
	ID        bson.ObjectID   `bson:"_id,omitempty" json:"_id"`
	User      bson.ObjectID   `bson:"user" json:"user"`
	Title     string          `bson:"title" json:"title"`
	Language  string          `bson:"language" json:"language"`
	Code      string          `bson:"code" json:"code"`
	Stars     []bson.ObjectID `bson:"stars" json:"stars"`
	Comments  []Comment       `bson:"comments" json:"comments"`
	CreatedAt time.Time       `bson:"createdAt,omitempty" json:"createdAt,omitempty"`
	UpdatedAt time.Time       `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
}

// UserPopulated represents the populated user details for API responses
type UserPopulated struct {
	ID       bson.ObjectID `json:"_id"`
	FullName string        `json:"fullName"`
	Email    string        `json:"email"`
}

// CommentResponse represents comment with populated user details
type CommentResponse struct {
	ID        bson.ObjectID `json:"_id"`
	User      UserPopulated `json:"user"`
	Text      string        `json:"text"`
	CreatedAt time.Time     `json:"createdAt"`
	UpdatedAt time.Time     `json:"updatedAt"`
}

// SnippetResponse represents snippet with populated user and comments user details
type SnippetResponse struct {
	ID        bson.ObjectID     `json:"_id"`
	User      UserPopulated     `json:"user"`
	Title     string            `json:"title"`
	Language  string            `json:"language"`
	Code      string            `json:"code"`
	Stars     []bson.ObjectID   `json:"stars"`
	Comments  []CommentResponse `json:"comments"`
	CreatedAt time.Time         `json:"createdAt"`
	UpdatedAt time.Time         `json:"updatedAt"`
}
