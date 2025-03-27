build:
	go build -o extension/bin/gotestscraper cmd/gotestscraper/main.go
	pnpm run compile

run:
	@echo "Hey uh... please just use 'go run' directly:"
	@echo
	@echo "	go run cmd/gotestscraper/main.go"
	@echo
	@echo "Thanks!"

test:
	go test -v ./...

clean:
	rm -f extension/bin/gotestscraper
	rm -rf extension/out

.PHONY: build test clean
