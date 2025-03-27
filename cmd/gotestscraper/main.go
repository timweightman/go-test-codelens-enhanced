package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"

	"github.com/timweightman/go-test-codelens-enhanced/gotestscraper"
)

func main() {
	var filePath string
	var debug bool

	flag.StringVar(&filePath, "f", "", "[required] absolute file path")
	flag.BoolVar(&debug, "d", false, "[optional] debug mode")

	flag.Parse()

	if filePath == "" {
		fmt.Println("Required flags are not set.")
		flag.Usage()

		os.Exit(1)
		return
	}

	if debug {
		gotestscraper.SetLogLevel(gotestscraper.LogLevelDebug)
	}

	// Find all test names in the file
	testNames, err := gotestscraper.ScrapeAllTests(filePath)
	if err != nil {
		panic(fmt.Errorf("failed to find all test names: %w", err))
	}

	json, err := json.Marshal(testNames)
	if err != nil {
		panic(fmt.Errorf("failed to marshal test names: %w", err))
	}

	fmt.Println(string(json))
}
