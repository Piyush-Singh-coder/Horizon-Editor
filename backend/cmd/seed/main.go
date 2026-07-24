package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"time"

	"github.com/Piyush-Singh-coder/horizon-golang/internal/config"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/database"
	"github.com/Piyush-Singh-coder/horizon-golang/internal/model"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type SnippetDynamoModel struct {
	ID        string `dynamodbav:"id"`
	UserID    string `dynamodbav:"userId"`
	Title     string `dynamodbav:"title"`
	Language  string `dynamodbav:"language"`
	Code      string `dynamodbav:"code"`
	CreatedAt string `dynamodbav:"createdAt"`
	UpdatedAt string `dynamodbav:"updatedAt"`
}

func main() {
	slog.SetDefault(slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo})))

	slog.Info("Loading configuration for seeding...")
	cfg := config.LoadConfig()

	// Connect to MongoDB
	dbClient, err := database.ConnectDB(cfg)
	if err != nil {
		slog.Error("Failed to connect to MongoDB for seeding", "error", err)
	}

	// Connect to DynamoDB
	dynamoClient, err := database.ConnectDynamoDB(cfg)
	if err != nil {
		slog.Warn("Failed to connect to DynamoDB for seeding", "error", err)
	}

	snippets := []model.Snippet{
		{
			ID:       bson.NewObjectID(),
			Title:    "Binary Search Algorithm in Go",
			Language: "go",
			Code:     "package main\n\nimport \"fmt\"\n\nfunc binarySearch(arr []int, target int) int {\n    left, right := 0, len(arr)-1\n    for left <= right {\n        mid := left + (right-left)/2\n        if arr[mid] == target {\n            return mid\n        }\n        if arr[mid] < target {\n            left = mid + 1\n        } else {\n            right = mid - 1\n        }\n    }\n    return -1\n}\n\nfunc main() {\n    nums := []int{2, 5, 8, 12, 16, 23, 38, 56, 72, 91}\n    fmt.Println(\"Index of 23:\", binarySearch(nums, 23))\n}",
		},
		{
			ID:       bson.NewObjectID(),
			Title:    "Fibonacci Sequence with Memoization",
			Language: "python",
			Code:     "def fibonacci(n, memo={}):\n    if n in memo:\n        return memo[n]\n    if n <= 1:\n        return n\n    memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo)\n    return memo[n]\n\nif __name__ == \"__main__\":\n    for i in range(10):\n        print(f\"Fibonacci({i}) = {fibonacci(i)}\")",
		},
		{
			ID:       bson.NewObjectID(),
			Title:    "Async Concurrent Fetching in TypeScript",
			Language: "typescript",
			Code:     "interface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\nasync function fetchUserData(userIds: number[]): Promise<User[]> {\n  const requests = userIds.map(id =>\n    fetch(\"https://jsonplaceholder.typicode.com/users/\" + id).then(res => res.json())\n  );\n  return Promise.all(requests);\n}\n\nfetchUserData([1, 2, 3]).then(users => console.log(\"Users:\", users));",
		},
		{
			ID:       bson.NewObjectID(),
			Title:    "Fast In-Memory LRU Cache in Rust",
			Language: "rust",
			Code:     "use std::collections::HashMap;\n\npub struct LRUCache {\n    capacity: usize,\n    map: HashMap<i32, i32>,\n}\n\nimpl LRUCache {\n    pub fn new(capacity: usize) -> Self {\n        LRUCache { capacity, map: HashMap::new() }\n    }\n    pub fn get(&mut self, key: i32) -> Option<&i32> {\n        self.map.get(&key)\n    }\n    pub fn put(&mut self, key: i32, value: i32) {\n        self.map.insert(key, value);\n    }\n}\n\nfn main() {\n    let mut cache = LRUCache::new(2);\n    cache.put(1, 100);\n    println!(\"Val: {:?}\", cache.get(1));\n}",
		},
		{
			ID:       bson.NewObjectID(),
			Title:    "QuickSort Algorithm in C++",
			Language: "cpp",
			Code:     "#include <iostream>\n#include <vector>\n\nint partition(std::vector<int>& arr, int low, int high) {\n    int pivot = arr[high];\n    int i = low - 1;\n    for (int j = low; j < high; j++) {\n        if (arr[j] < pivot) {\n            i++;\n            std::swap(arr[i], arr[j]);\n        }\n    }\n    std::swap(arr[i + 1], arr[high]);\n    return i + 1;\n}\n\nvoid quickSort(std::vector<int>& arr, int low, int high) {\n    if (low < high) {\n        int pi = partition(arr, low, high);\n        quickSort(arr, low, pi - 1);\n        quickSort(arr, pi + 1, high);\n    }\n}\n\nint main() {\n    std::vector<int> arr = {10, 7, 8, 9, 1, 5};\n    quickSort(arr, 0, arr.size() - 1);\n    std::cout << \"Sorted array: \";\n    for (int x : arr) std::cout << x << \" \";\n    std::cout << std::endl;\n    return 0;\n}",
		},
		{
			ID:       bson.NewObjectID(),
			Title:    "Debounce Utility Function in JavaScript",
			Language: "javascript",
			Code:     "function debounce(func, delay = 300) {\n  let timer;\n  return function (...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => {\n      func.apply(this, args);\n    }, delay);\n  };\n}\n\nconst handleSearch = debounce((query) => {\n  console.log(\"Searching API for:\", query);\n}, 500);\n\nhandleSearch(\"Golang\");",
		},
		{
			ID:       bson.NewObjectID(),
			Title:    "Java Multi-threaded Producer Consumer Pattern",
			Language: "java",
			Code:     "import java.util.concurrent.ArrayBlockingQueue;\nimport java.util.concurrent.BlockingQueue;\n\npublic class ProducerConsumer {\n    public static void main(String[] args) {\n        BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(5);\n\n        Thread producer = new Thread(() -> {\n            try {\n                for (int i = 1; i <= 5; i++) {\n                    queue.put(i);\n                    System.out.println(\"Produced: \" + i);\n                }\n            } catch (InterruptedException e) {}\n        });\n\n        producer.start();\n    }\n}",
		},
		{
			ID:       bson.NewObjectID(),
			Title:    "Custom HTTP Middleware Chain in Go",
			Language: "go",
			Code:     "package main\n\nimport (\n    \"log\"\n    \"net/http\"\n    \"time\"\n)\n\nfunc LoggingMiddleware(next http.HandlerFunc) http.HandlerFunc {\n    return func(w http.ResponseWriter, r *http.Request) {\n        start := time.Now()\n        log.Printf(\"Started %s %s\", r.Method, r.URL.Path)\n        next(w, r)\n        log.Printf(\"Completed in %v\", time.Since(start))\n    }\n}\n\nfunc main() {\n    handler := LoggingMiddleware(func(w http.ResponseWriter, r *http.Request) {\n        w.Write([]byte(\"Hello from Middleware!\"))\n    })\n    http.HandleFunc(\"/\", handler)\n    log.Println(\"Server running on :8080\")\n}",
		},
		{
			ID:       bson.NewObjectID(),
			Title:    "JWT Token Parser in Node.js",
			Language: "javascript",
			Code:     "function parseJWT(token) {\n  const [header, payload, signature] = token.split('.');\n  const decodedPayload = Buffer.from(payload, 'base64').toString('utf8');\n  return JSON.parse(decodedPayload);\n}\n\nconst token = \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c\";\nconsole.log(\"Payload:\", parseJWT(token));",
		},
		{
			ID:       bson.NewObjectID(),
			Title:    "Dijkstra's Shortest Path Algorithm in Python",
			Language: "python",
			Code:     "import heapq\n\ndef dijkstra(graph, start):\n    distances = {node: float('infinity') for node in graph}\n    distances[start] = 0\n    priority_queue = [(0, start)]\n\n    while priority_queue:\n        current_distance, current_node = heapq.heappop(priority_queue)\n\n        if current_distance > distances[current_node]:\n            continue\n\n        for neighbor, weight in graph[current_node].items():\n            distance = current_distance + weight\n            if distance < distances[neighbor]:\n                distances[neighbor] = distance\n                heapq.heappush(priority_queue, (distance, neighbor))\n\n    return distances\n\ngraph = {'A': {'B': 4, 'C': 2}, 'B': {'A': 4, 'C': 1}, 'C': {'A': 2, 'B': 1}}\nprint(\"Shortest distances from A:\", dijkstra(graph, 'A'))",
		},
	}

	dummyUserID := bson.NewObjectID().Hex()
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// Seed DynamoDB if connected
	if dynamoClient != nil {
		slog.Info("Seeding 10 snippets into AWS DynamoDB horizon-snippets table...")
		for _, s := range snippets {
			item := SnippetDynamoModel{
				ID:        s.ID.Hex(),
				UserID:    dummyUserID,
				Title:     s.Title,
				Language:  s.Language,
				Code:      s.Code,
				CreatedAt: time.Now().Format(time.RFC3339),
				UpdatedAt: time.Now().Format(time.RFC3339),
			}

			av, err := attributevalue.MarshalMap(item)
			if err != nil {
				slog.Error("failed to marshal snippet for DynamoDB", "title", s.Title, "error", err)
				continue
			}

			_, err = dynamoClient.Client.PutItem(ctx, &dynamodb.PutItemInput{
				TableName: aws.String("horizon-snippets"),
				Item:      av,
			})
			if err != nil {
				slog.Error("failed to insert snippet into DynamoDB", "title", s.Title, "error", err)
			} else {
				fmt.Printf("✓ DynamoDB: Seeded '%s' (%s)\n", s.Title, s.Language)
			}
		}
	}

	// Seed MongoDB if connected
	if dbClient != nil {
		slog.Info("Seeding 10 snippets into MongoDB snippets collection...")
		snippetsCol := dbClient.Collection("snippets")
		dummyObjID, _ := bson.ObjectIDFromHex(dummyUserID)
		for _, s := range snippets {
			s.User = dummyObjID
			s.CreatedAt = time.Now()
			s.UpdatedAt = time.Now()
			s.Stars = []bson.ObjectID{}
			s.Comments = []model.Comment{}

			_, err := snippetsCol.InsertOne(ctx, s)
			if err != nil {
				slog.Error("failed to insert snippet into MongoDB", "title", s.Title, "error", err)
			} else {
				fmt.Printf("✓ MongoDB: Seeded '%s' (%s)\n", s.Title, s.Language)
			}
		}
	}

	slog.Info("🎉 Successfully completed seeding 10 code snippets!")
}
