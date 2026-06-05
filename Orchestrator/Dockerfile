FROM golang:1.26.2-alpine AS build

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o orchestrator .

FROM alpine:3.21

WORKDIR /app

COPY --from=build /app/orchestrator .

EXPOSE 8085

CMD ["./orchestrator"]
