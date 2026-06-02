package main

import (
	"log"
	"net"
	"os"

	"purchase-service/internal/clients"
	"purchase-service/internal/grpc-auth"
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
	dsn := os.Getenv("DB_DSN")
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	if err := db.AutoMigrate(
		&repository.CartModel{},
		&repository.ItemModel{},
		&repository.TokenModel{},
	); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	// --- External service clients ---
	toursClient := clients.NewToursClient(os.Getenv("TOURS_SERVICE_URL"))
	stakeholdersClient := clients.NewStakeholdersClient(os.Getenv("STAKEHOLDERS_SERVICE_URL"))

	// --- Wire dependencies ---
	repo := repository.NewPurchaseRepository(db)
	svc := service.NewPurchaseService(repo, repo, toursClient, stakeholdersClient)
	h := handler.NewPurchaseHandler(svc)

	// --- gRPC server ---
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer(
		grpc.UnaryInterceptor(grpcauth.UnaryAuthInterceptor),
	)
	pb.RegisterPurchaseServiceServer(grpcServer, h)

	log.Println("Purchase service listening on :50051")
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
