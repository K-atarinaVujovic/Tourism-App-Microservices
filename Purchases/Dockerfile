FROM golang:alpine AS builder
WORKDIR /usr/src/app
COPY Purchases/go.mod Purchases/go.sum ./
COPY Common /usr/src/Common
RUN go mod download
COPY Purchases/ .
RUN go build -o purchases ./cmd/main.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /usr/src/app/purchases .
EXPOSE 9095
CMD ["./purchases"]