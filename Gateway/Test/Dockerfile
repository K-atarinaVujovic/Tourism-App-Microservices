FROM golang:latest

WORKDIR /usr/src/app

COPY go.mod go.sum ./
COPY proto ./proto
COPY Test/service.go ./
RUN go mod download

RUN go build -v -o /usr/local/bin/app ./service.go

CMD ["app"]
