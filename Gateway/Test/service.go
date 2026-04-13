package main

import (
	"context"
	"encoding/json"
	"log"
	"net"
	"net/http"

	servicepb "gateway/proto/service"
	"google.golang.org/grpc"
)

type server struct {
	servicepb.UnimplementedAlbumServiceServer
}

// --- Data ---

var albums = []*servicepb.Album{
	{Id: "1", Title: "Blue Train", Artist: "John Coltrane", Price: 56.99},
	{Id: "2", Title: "Jeru", Artist: "Gerry Mulligan", Price: 17.99},
	{Id: "3", Title: "Sarah Vaughan and Clifford Brown", Artist: "Sarah Vaughan", Price: 39.99},
}

var compositors = []map[string]any{
	{"id": "1", "name": "Miles Davis", "genre": "Jazz"},
	{"id": "2", "name": "Ludwig van Beethoven", "genre": "Classical"},
}

// --- REST: GET /compositors ---

func getCompositorsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(compositors)
}

// --- gRPC: GetAlbums ---

func (s *server) GetAlbums(ctx context.Context, req *servicepb.GetAlbumsRequest) (*servicepb.GetAlbumsResponse, error) {
	return &servicepb.GetAlbumsResponse{Albums: albums}, nil
}

func main() {
	// REST server
	go func() {
		http.HandleFunc("/compositors", getCompositorsHandler)
		log.Println("Starting REST server on :8080")
		log.Fatal(http.ListenAndServe(":8080", nil))
	}()

	// gRPC server
	lis, err := net.Listen("tcp", ":8081")
	if err != nil {
		log.Fatal("Failed to listen: ", err)
	}

	s := grpc.NewServer()
	servicepb.RegisterAlbumServiceServer(s, &server{})

	log.Println("Starting gRPC server on :8081")
	log.Fatal(s.Serve(lis))
}