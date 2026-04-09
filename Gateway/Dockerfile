FROM golang:latest

WORKDIR /usr/src/app

COPY go.mod go.sum ./
COPY proto ./proto
RUN go mod download

COPY . .
RUN go build -v -o /usr/local/bin/app ./gateway.go

CMD ["app"]
