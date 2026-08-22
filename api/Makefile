.PHONY: run dev build fmt fmt-check vet lint test tidy sqlc seed migrate-media release release-snapshot clean

run: dev

dev:
	go run ./cmd/api

build:
	go build -o bin/api ./cmd/api

# Regenerates internal/db from sqlc.yaml + supabase/migrations + queries.
sqlc:
	sqlc generate

# Upserts stub projects + about page into Postgres (requires API_DATABASE_URL).
seed:
	go run ./cmd/seed

# Upload local seed thumbnails (if present) to Supabase Storage and rewrite
# thumbnail_url + body image URLs (requires DB URL + API_SUPABASE_SERVICE_ROLE_KEY).
migrate-media:
	go run ./cmd/migrate-media

# Formats code in place with gofmt + goimports (via golangci-lint fmt).
fmt:
	golangci-lint fmt ./...

# Fails if any file is not already formatted (use in CI).
fmt-check:
	@test -z "$$(gofmt -l .)" || (echo "gofmt needs to be run on:"; gofmt -l .; exit 1)

vet:
	go vet ./...

lint:
	golangci-lint run ./...

test:
	go test ./...

tidy:
	go mod tidy

# Builds all release artifacts locally without publishing.
release-snapshot:
	goreleaser release --snapshot --clean

# Publishes a real release; requires a git tag like api/v1.0.0 and GITHUB_TOKEN.
release:
	goreleaser release --clean

clean:
	rm -rf bin dist
