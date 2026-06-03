# Purchase Service

gRPC microservice for tour purchases, shopping cart, and purchase tokens.

## Project Structure

```
purchase-service/
├── cmd/
│   └── main.go                      # entry point, wires everything
├── internal/
│   ├── domain/
│   │   └── purchase.go              # core business types & logic
│   ├── service/
│   │   └── service.go               # business rules
│   ├── repository/
│   │   ├── models.go                # GORM DB models
│   │   └── repository.go            # DB access + domain mappers
│   └── handler/
│       └── handler.go               # gRPC request/response handling
├── proto/
│   └── purchase.proto               # service definition
├── pb/                              # generated protobuf Go code (see below)
├── docker-compose.yml
└── go.mod
```

## Setup

### 1. Start the database
```bash
docker compose up -d
```

### 2. Install dependencies
```bash
go mod tidy
```

### 3. Generate protobuf code
Install the tools once:
```bash
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
```

Then generate:
```bash
 protoc --go_out=. --go-grpc_out=. purchase.proto
```

This creates `pb/purchase.pb.go` and `pb/purchase_grpc.pb.go`.

### 4. Run the service
```bash
go run cmd/main.go
```

Service starts on `:50051`.

## Registering in the gateway

```go
import purchasepb "gateway/proto/purchase"

var MicroserviceRegistry = map[string]func(...) error{
    "service": servicepb.RegisterAlbumServiceHandlerFromEndpoint,
    "profile": profilepb.RegisterProfileServiceHandlerFromEndpoint,
    "purchase": purchasepb.RegisterPurchaseServiceHandlerFromEndpoint,
}
```