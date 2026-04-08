FROM golang:latest

WORKDIR /usr/src/app

COPY ../go.mod ../go.sum ./
RUN go mod download

COPY ../Test .
RUN go build -v -o /usr/local/bin/app ./service.go

CMD ["app"]
