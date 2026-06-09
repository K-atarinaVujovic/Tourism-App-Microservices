module purchase-service

go 1.26.2

require (
	github.com/google/uuid v1.6.0
	github.com/rabbitmq/amqp091-go v1.11.0
	gojwt v0.0.0
	google.golang.org/grpc v1.64.0
	google.golang.org/protobuf v1.34.2
	gorm.io/driver/mysql v1.5.7
	gorm.io/gorm v1.25.10
)

replace gojwt => ../Common/JwtModules/GoJwt

require (
	github.com/go-sql-driver/mysql v1.7.0 // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/jinzhu/now v1.1.5 // indirect
	golang.org/x/net v0.22.0 // indirect
	golang.org/x/sys v0.18.0 // indirect
	golang.org/x/text v0.14.0 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20240318140521-94a12d6c2237 // indirect
)
