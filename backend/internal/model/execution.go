package model

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Execution struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"_id"`
	User      bson.ObjectID `bson:"user" json:"user"`
	Language  string        `bson:"language" json:"language"`
	Code      string        `bson:"code" json:"code"`
	Output    string        `bson:"output" json:"output"`
	CreatedAt time.Time     `bson:"createdAt,omitempty" json:"createdAt,omitempty"`
	UpdatedAt time.Time     `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
}
