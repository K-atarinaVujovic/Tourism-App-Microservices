package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
)

// Microservices CONFIG FOR NAMES/PATH OF THE MICROSERVICES
var Microservices = [...]string{
	// [...] creates a fixed array by letting the compiler determine the size
	"blog",
	"auth",

	//Test
	"service",
}

// PORT has to match the port in docker-compose.yml
const PORT = "8080"

// ProxyReqistry This is a struct so we can later expand it
type ProxyReqistry struct {
	name  string
	route *httputil.ReverseProxy
}

func NewProxy(targetHost string) (*httputil.ReverseProxy, error) {
	url, err := url.Parse(targetHost)
	if err != nil {
		return nil, err
	}

	return httputil.NewSingleHostReverseProxy(url), nil
}

func ProxyRequestHandler(proxies []ProxyReqistry) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Println("Got request: " + r.URL.String())
		proxy := FindProxy(proxies, r)
		if proxy.name != "" {
			r.URL.Path = strings.TrimPrefix(r.URL.Path, "/api/"+proxy.name)
			proxy.route.ServeHTTP(w, r)
			log.Println("Proxying request to: http://" + r.URL.String()) // We are sending to http://service:8081/<path>
		} else {
			http.NotFound(w, r)
		}
	}
}

func InitProxies() []ProxyReqistry {
	var listOfProxies []ProxyReqistry
	for _, service := range Microservices {
		proxy, err := NewProxy("http://" + service + ":8081")
		if err != nil {
			panic(err)
		}
		listOfProxies = append(listOfProxies, ProxyReqistry{
			name:  service,
			route: proxy,
		})
	}
	return listOfProxies
}

func FindProxy(proxies []ProxyReqistry, r *http.Request) ProxyReqistry {
	for _, proxy := range proxies {
		if strings.HasPrefix(strings.TrimPrefix(r.URL.Path, "/api/"), proxy.name) {
			return proxy
		}
	}
	return ProxyReqistry{}
}

func main() {
	// Initialize a reverse proxy for each microservice defined in Microservices
	listOfProxies := InitProxies()

	// Handle all requests to the server using the proxy
	http.HandleFunc("/", ProxyRequestHandler(listOfProxies))
	log.Fatal(http.ListenAndServe(":"+PORT, nil))
}
