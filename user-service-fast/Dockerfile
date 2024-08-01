FROM golang:1.22.0-alpine
WORKDIR /src/app

COPY . .
RUN go mod download
RUN go build -o user-service-fast main.go
CMD ["./bin/user-service-fast"]