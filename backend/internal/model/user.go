package model

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type User struct {
	ID           bson.ObjectID `bson:"_id,omitempty" json:"_id"`
	FullName     string        `bson:"fullName" json:"fullName"`
	Email        string        `bson:"email" json:"email"`
	Password     string        `bson:"password,omitempty" json:"password,omitempty"`
	AuthProvider string        `bson:"authProvider" json:"authProvider"`
	IsVerified   bool          `bson:"isVerified" json:"isVerified"`
	CreatedAt    time.Time     `bson:"createdAt,omitempty" json:"createdAt,omitempty"`
	UpdatedAt    time.Time     `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
}
