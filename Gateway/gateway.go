package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"

	"gopkg.in/yaml.v3"
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
	name  string
	route *httputil.ReverseProxy
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

func NewProxy(targetHost string) (*httputil.ReverseProxy, error) {
	url, err := url.Parse(targetHost)
	if err != nil {
		return nil, err
	}

	return httputil.NewSingleHostReverseProxy(url), nil
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

func InitProxies(services []ServiceConfig) []ProxyRegistry {
	var listOfProxies []ProxyRegistry
	for _, svc := range services {
		proxy, err := NewProxy(svc.URL)
		if err != nil {
			panic(err)
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
	// Initialize a reverse proxy for each microservice defined in Microservices
	listOfProxies := InitProxies(config.Services)

	// Handle all requests to the server using the proxy
	http.HandleFunc("/", ProxyRequestHandler(listOfProxies))
	log.Fatal(http.ListenAndServe(":"+config.Port, nil))
}
