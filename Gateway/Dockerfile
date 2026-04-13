FROM golang:latest

WORKDIR /usr/src/app

COPY ./Gateway/go.mod ./Gateway/go.sum ./
COPY ./Gateway/proto ./proto
COPY ./Common /usr/src/Common
RUN go mod download

COPY ./Gateway .
RUN go build -v -o /usr/local/bin/app ./gateway.go

CMD ["app"]
