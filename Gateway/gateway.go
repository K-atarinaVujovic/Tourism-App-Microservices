package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"gopkg.in/yaml.v3"

	"gateway/jwtreader"
	servicepb "gateway/proto/service"
)

// MicroserviceRegistry Should contain all generated API handlers
var MicroserviceRegistry = map[string]func(context.Context, *runtime.ServeMux, string, []grpc.DialOption) error{
	"service": servicepb.RegisterAlbumServiceHandlerFromEndpoint,
	// add more services here
}

type ServiceConfig struct {
	Name     string `yaml:"name"`
	REST_URL string `yaml:"rest_url"`
	GRPC_URL string `yaml:"grpc_url"`
}

type Config struct {
	Port          string          `yaml:"port"`
	Services      []ServiceConfig `yaml:"services"`
	ExcludedPaths []string        `yaml:"excluded_paths"`
}

type ProxyRegistry struct {
	name        string
	restHandler http.Handler
	grpcHandler http.Handler
}

type responseRecorder struct {
	http.ResponseWriter
	statusCode int
	body       []byte
}

func (rec *responseRecorder) WriteHeader(code int) {
	rec.statusCode = code
}

func (rec *responseRecorder) Write(b []byte) (int, error) {
	rec.body = append(rec.body, b...)
	return len(b), nil
}

func JWTAuthMiddleware(excludedPaths []string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip JWT auth for certain paths if needed
		if isExcluded(r.URL.Path, excludedPaths) {
			next.ServeHTTP(w, r)
			return
		}

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			log.Printf("Missing Authorization header")
			http.Error(w, "Missing Authorization header", http.StatusUnauthorized)
			return
		}

		token, err := jwtreader.ReadFromAuthorizationHeader(authHeader)
		if err != nil {
			log.Printf("JWT validation failed: %v", err)
			http.Error(w, "Invalid JWT token", http.StatusUnauthorized)
			return
		}

		// Add user info to request context
		ctx := context.WithValue(r.Context(), "user_id", token.Claims.UserID)
		ctx = context.WithValue(ctx, "username", token.Claims.Username)
		ctx = context.WithValue(ctx, "role", token.Claims.Role)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
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

func isExcluded(path string, excludedPaths []string) bool {
	for _, p := range excludedPaths {
		if strings.Contains(path, p) {
			return true
		}
	}
	return false
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

	mux := runtime.NewServeMux(
		// Forward security headers
		runtime.WithIncomingHeaderMatcher(func(key string) (string, bool) {
			switch strings.ToLower(key) {
			case "authorization":
				return key, true
			default:
				return runtime.DefaultHeaderMatcher(key)
			}
		}),
	)

	if err := register(context.Background(), mux, svc.GRPC_URL, opts); err != nil {
		return nil, err
	}
	return mux, nil
}

// ProxyRequestHandler Handles requests by trying gRPC first, then REST
func ProxyRequestHandler(proxies []ProxyRegistry) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		proxy := FindProxy(proxies, r)
		if proxy.name == "" {
			log.Printf("No proxy found for path: %s", r.URL.Path)
			http.NotFound(w, r)
			return
		}

		r.URL.Path = strings.TrimPrefix(r.URL.Path, "/"+proxy.name)

		// Try gRPC first
		if proxy.grpcHandler != nil {
			rec := &responseRecorder{ResponseWriter: w, statusCode: http.StatusOK}
			proxy.grpcHandler.ServeHTTP(rec, r)

			if rec.statusCode != http.StatusNotFound {
				// gRPC handled it, write the recorded response
				log.Printf("[%s][gRPC] %s %s -> %d", proxy.name, r.Method, r.URL.String(), rec.statusCode)
				w.WriteHeader(rec.statusCode)
				w.Write(rec.body)
				return
			}

			// If gRPC returned 404, fall through to REST
			log.Printf("[%s][gRPC->REST fallback] %s %s", proxy.name, r.Method, r.URL.String())
		}

		// Fall back to REST
		if proxy.restHandler != nil {
			log.Printf("[%s][REST] %s %s", proxy.name, r.Method, r.URL.String())
			proxy.restHandler.ServeHTTP(w, r)
			return
		}

		http.NotFound(w, r)
	}
}

// InitProxies Create both gRPC and REST proxies for each service
func InitProxies(services []ServiceConfig, opts []grpc.DialOption) []ProxyRegistry {
	var listOfProxies []ProxyRegistry

	for _, svc := range services {
		var grpcHandler, restHandler http.Handler

		if svc.GRPC_URL != "" {
			h, err := NewGRPCProxy(svc, opts)
			if err != nil {
				log.Printf("[%s] gRPC init failed: %v", svc.Name, err)
			} else {
				grpcHandler = h
			}
		}

		if svc.REST_URL != "" {
			h, err := NewRESTProxy(svc.REST_URL)
			if err != nil {
				log.Printf("[%s] REST init failed: %v", svc.Name, err)
			} else {
				restHandler = h
			}
		}

		if grpcHandler == nil && restHandler == nil {
			log.Printf("[%s] no handlers, skipping", svc.Name)
			continue
		}

		listOfProxies = append(listOfProxies, ProxyRegistry{
			name:        svc.Name,
			grpcHandler: grpcHandler,
			restHandler: restHandler,
		})
	}

	return listOfProxies
}

func FindProxy(proxies []ProxyRegistry, r *http.Request) ProxyRegistry {
	for _, proxy := range proxies {
		if strings.HasPrefix(r.URL.Path, "/"+proxy.name) {
			return proxy
		}
	}
	return ProxyRegistry{}
}

func main() {
	// Load config
	config, err := LoadConfig("CONFIG.yaml")
	if err != nil {
		log.Fatal("Failed to load config: ", err)
	}

	// Initialize gRPC options
	opts := []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}

	// Initialize a reverse proxy for each microservice defined in Microservices
	listOfProxies := InitProxies(config.Services, opts)

	// Create proxy handler
	proxyHandler := http.HandlerFunc(ProxyRequestHandler(listOfProxies))

	// Wrap with JWT authentication middleware
	authHandler := JWTAuthMiddleware(config.ExcludedPaths, proxyHandler)

	// Handle all requests to the server using the authenticated proxy
	http.Handle("/", authHandler)

	log.Printf("Starting gateway on port %s", config.Port)
	log.Fatal(http.ListenAndServe(":"+config.Port, nil))
}
