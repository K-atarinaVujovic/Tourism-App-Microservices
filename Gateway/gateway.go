package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"gopkg.in/yaml.v3"

	testpb "gateway/proto/test"
)

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
	name    string
	handler func(*runtime.ServeMux, string, []grpc.DialOption) error
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

func InitProxies(services []ServiceConfig) []ProxyRegistry {
	var listOfProxies []ProxyRegistry
	for _, svc := range services {
		switch svc.Name {
		case "test":
			listOfProxies = append(listOfProxies, ProxyRegistry{
				name: svc.Name,
				handler: func(mux *runtime.ServeMux, url string, opts []grpc.DialOption) error {
					return testpb.RegisterAuthServiceHandlerFromEndpoint(context.Background(), mux, url, opts)
				},
			})
		}
	}
	return listOfProxies
}

func main() {
	config, err := LoadConfig("CONFIG.yaml")
	if err != nil {
		log.Fatal("Failed to load config: ", err)
	}

	mux := runtime.NewServeMux()
	opts := []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}

	listOfProxies := InitProxies(config.Services)
	for _, svc := range config.Services {
		for _, proxy := range listOfProxies {
			if proxy.name == svc.Name {
				if err := proxy.handler(mux, svc.URL, opts); err != nil {
					log.Fatalf("Failed to register %s: %v", svc.Name, err)
				}
				log.Println("Registered service: " + svc.Name + " at " + svc.URL)
			}
		}
	}

	log.Println("Gateway running on port " + config.Port)
	log.Fatal(http.ListenAndServe(":"+config.Port, mux))
}
