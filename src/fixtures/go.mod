module github.com/timweightman/go-test-codelens-enhanced/tests/fixtures

go 1.22.0

// This little hack allows us to open fixture_test.go, such that clicking
// our table-driven run/debug CodeLens will *actually* run stuff correctly.
// If we didn't have a `go.mod` file here, then `go test` would fail.
// Similarly, if we didn't have this replace directive, then `go test` would
// fail report that it can't find the module/package.
replace github.com/timweightman/go-test-codelens-enhanced/tests/fixtures => ./
