package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"fmt"
	"strings"
	"net/url"
	"net/http/httputil"

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
	REST_URL  string `yaml:"rest_url"`
	GRPC_URL  string `yaml:"grpc_url"`
}

type Config struct {
	Port     string          `yaml:"port"`
	Services []ServiceConfig `yaml:"services"`
}

type ProxyRegistry struct {
    name    string
    handler http.Handler
    isGRPC  bool
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

func NewRESTProxy(targetURL string) (http.Handler, error) {
    u, err := url.Parse(targetURL)
    if err != nil {
        return nil, err
    }
    return httputil.NewSingleHostReverseProxy(u), nil
}

func NewGRPCProxy(svc ServiceConfig, opts []grpc.DialOption) (http.Handler, error) {
    register, ok := MicroserviceRegistry[svc.Name]
    if !ok {
        return nil, fmt.Errorf("no gRPC registration found for: %s", svc.Name)
    }
    mux := runtime.NewServeMux()
    if err := register(context.Background(), mux, svc.GRPC_URL, opts); err != nil {
        return nil, err
    }
    return mux, nil
}

func ProxyRequestHandler(proxies []ProxyRegistry) func(http.ResponseWriter, *http.Request) {
    return func(w http.ResponseWriter, r *http.Request) {
        proxy := FindProxy(proxies, r)
        if proxy.name == "" {
            http.NotFound(w, r)
            return
        }

        transport := "REST"
        if proxy.isGRPC {
            transport = "gRPC"
        }
        log.Printf("[%s][%s] %s %s", proxy.name, transport, r.Method, r.URL.String())

        r.URL.Path = strings.TrimPrefix(r.URL.Path, "/api/"+proxy.name)
        proxy.handler.ServeHTTP(w, r)
    }
}

func InitProxies(services []ServiceConfig, opts []grpc.DialOption) []ProxyRegistry {
    var listOfProxies []ProxyRegistry

    for _, svc := range services {
        var handler http.Handler
        isGRPC := false

        // Try gRPC first if a grpc_url is configured
        if svc.GRPC_URL != "" {
            grpcHandler, err := NewGRPCProxy(svc, opts)
            if err != nil {
                log.Printf("[%s] gRPC init failed (%v), falling back to REST", svc.Name, err)
            } else {
                handler = grpcHandler
                isGRPC = true
            }
        }

        // Fall back to REST if gRPC wasn't used
        if handler == nil {
            restHandler, err := NewRESTProxy(svc.REST_URL)
            if err != nil {
                log.Printf("[%s] REST init also failed (%v), skipping service", svc.Name, err)
                continue
            }
            handler = restHandler
        }

        listOfProxies = append(listOfProxies, ProxyRegistry{
            name:    svc.Name,
            handler: handler,
            isGRPC:  isGRPC,
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
