package main

import (
	"log"
	"net"

	"purchase-service/internal/handler"
	"purchase-service/internal/repository"
	"purchase-service/internal/service"
	pb "purchase-service/pb"

	"google.golang.org/grpc"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	// --- Database ---
	dsn := "purchase:purchase@tcp(localhost:3306)/purchase?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	// auto-migrate creates/updates tables to match your models
	if err := db.AutoMigrate(
		&repository.CartModel{},
		&repository.ItemModel{},
		&repository.TokenModel{},
	); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	// --- Wire dependencies ---
	repo := repository.NewPurchaseRepository(db)
	svc := service.NewPurchaseService(repo, repo) // repo implements both interfaces
	h := handler.NewPurchaseHandler(svc)

	// --- gRPC server ---
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer()
	pb.RegisterPurchaseServiceServer(grpcServer, h)

	log.Println("Purchase service listening on :50051")
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}