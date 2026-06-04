module gateway

go 1.26.1

replace jwtreader => ../Common/JwtModules/GoJwt

require (
	github.com/grpc-ecosystem/grpc-gateway/v2 v2.29.0
	google.golang.org/genproto/googleapis/api v0.0.0-20260526163538-3dc84a4a5aaa
	google.golang.org/grpc v1.81.1
	google.golang.org/grpc/cmd/protoc-gen-go-grpc v1.6.2
	google.golang.org/protobuf v1.36.11
	gopkg.in/yaml.v3 v3.0.1
	jwtreader v0.0.0
)

require (
	github.com/kr/text v0.2.0 // indirect
	github.com/rogpeppe/go-internal v1.10.0 // indirect
	go.yaml.in/yaml/v3 v3.0.4 // indirect
	golang.org/x/net v0.55.0 // indirect
	golang.org/x/sys v0.45.0 // indirect
	golang.org/x/text v0.37.0 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20260526163538-3dc84a4a5aaa // indirect
)
