package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"gopkg.in/yaml.v3"

	servicepb "gateway/proto/service"
)

// MicroserviceRegistry Should contain all generated API handlers
var MicroserviceRegistry = map[string]func(context.Context, *runtime.ServeMux, string, []grpc.DialOption) error{
	"service": servicepb.RegisterAlbumServiceHandlerFromEndpoint,
	// add more services here
}

type ServiceConfig struct {
	Name string `yaml:"name"`
	URL  string `yaml:"url"`
}

type Config struct {
	Port     string          `yaml:"port"`
	Services []ServiceConfig `yaml:"services"`
}

// ProxyRegistry This is a struct so we can later expand it
type ProxyRegistry struct {
	name  string
	route *runtime.ServeMux
}

func LoadConfig(path string) (*Config, error) {
	content, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var config Config
	err = yaml.Unmarshal(content, &config)
	return &config, err
}

func NewProxy(svc ServiceConfig, opts []grpc.DialOption) (*runtime.ServeMux, error) {
	mux := runtime.NewServeMux()
	register, ok := MicroserviceRegistry[svc.Name]
	if !ok {
		return nil, fmt.Errorf("unknown service: %s", svc.Name)
	}
	if err := register(context.Background(), mux, svc.URL, opts); err != nil {
		return nil, err
	}
	return mux, nil
}

func ProxyRequestHandler(proxies []ProxyRegistry) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Println("Got request: " + r.Method + " " + r.URL.String())
		proxy := FindProxy(proxies, r)
		if proxy.name != "" {
			r.URL.Path = strings.TrimPrefix(r.URL.Path, "/api/"+proxy.name)
			proxy.route.ServeHTTP(w, r)
		} else {
			http.NotFound(w, r)
		}
	}
}

func InitProxies(services []ServiceConfig, opts []grpc.DialOption) []ProxyRegistry {
	var listOfProxies []ProxyRegistry
	for _, svc := range services {
		proxy, err := NewProxy(svc, opts)
		if err != nil {
			log.Printf("Failed to create proxy for %s: %v", svc.Name, err)
			continue // Don't panic so the gateway doesn't crash
		}
		listOfProxies = append(listOfProxies, ProxyRegistry{
			name:  svc.Name,
			route: proxy,
		})
	}
	return listOfProxies
}

func FindProxy(proxies []ProxyRegistry, r *http.Request) ProxyRegistry {
	for _, proxy := range proxies {
		if strings.HasPrefix(strings.TrimPrefix(r.URL.Path, "/api/"), proxy.name) {
			return proxy
		}
	}
	return ProxyRegistry{} // empty
}

func main() {
	// Load config
	config, err := LoadConfig("CONFIG.yaml")
	if err != nil {
		log.Fatal("Failed to load config: ", err)
	}

	// TODO: Add security
	opts := []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}

	// Initialize a reverse proxy for each microservice defined in Microservices
	listOfProxies := InitProxies(config.Services, opts)

	// Handle all requests to the server using the proxy
	http.HandleFunc("/", ProxyRequestHandler(listOfProxies))
	log.Fatal(http.ListenAndServe(":"+config.Port, nil))
}
