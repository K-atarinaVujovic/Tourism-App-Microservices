# syntax=docker/dockerfile:1

FROM golang:1.26.2-alpine AS build

WORKDIR /app

RUN apk add --no-cache ca-certificates

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o auth-server ./auth_server.go

FROM alpine:3.21

WORKDIR /app

RUN apk add --no-cache ca-certificates

COPY --from=build /app/auth-server /app/auth-server

EXPOSE 8080

CMD ["/app/auth-server"]
