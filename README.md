# Go Test CodeLens - Enhanced

A VS Code extension that enhances the Go testing experience by providing CodeLens support for running and debugging table-driven tests directly from your editor.

## CodeLens support for table-driven tests
Specialised CodeLens using detailed, carefully tested regular expression parsing to support table-driven test patterns.

This extension:

1. **Can handle any structured slice or map.**
1. **Does not require any specific property naming** - it will work with variable names or struct field names that you pass to `t.Run` as the first ("name") argument.

Relies on the [Go for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=golang.Go) extension.

`Run test` | `Debug test` - both supported, for individual table-driven test scenarios.

## 🗺️ Maps
```go
table := map[string]string{
  // run test | debug test      <-- CodeLens run/debug "test name one"
  "test name one": "whatever",
  // run test | debug test      <-- CodeLens run/debug "test name two"
  "test name two": "whatever",
}

for k, v := range table {
  t.Run(k, func(t *testing.T) {
    t.Parallel()
    fmt.Println(k, v)
  })
}
```
## 🍞 Slices
```go
table := []struct {
  stuff string // <-- Arbitrary test name given as t.Run(v.stuff, ...)
  value string
}{
  {
    // run test | debug test      <-- CodeLens run/debug "test name one"
    stuff: "test name one",
    value: "value1",
  },
  {
    // run test | debug test      <-- CodeLens run/debug "test name two"
    stuff: "test name two",
    value: "value2",
  },
}

for _, v := range table {
  t.Run(v.stuff, func(t *testing.T) {
    t.Parallel()
    fmt.Println(v.stuff, v.value)
  })
}
```

## 🦹 What are you doing, you monster! (but it _does_ work) 🙈
```go
mTable := map[string]string{
  "test name one": "value1",
  "test name two": "value2",
}
sTable := []struct {
  name  string
  value string
}{
  {
    name:  "test name one",
    value: "value1",
  },
  {
    name:  "test name two",
    value: "value2",
  },
}

for k, v := range mTable {
  t.Run(k, func(t *testing.T) {
    t.Parallel()
    fmt.Println(k, v)
  })
}

for _, v := range sTable {
  t.Run(v.name, func(t *testing.T) {
    t.Parallel()
    fmt.Println(v.name, v.value)
  })
}
```

## How you can use it
1. Open any Go test file (*_test.go)
1. Find any slice- or map-based table-driven tests
1. Look for the `Run test | Debug test` CodeLens above the test name
1. Click, and watch the magic unfold 🧙 ✨ 🧪 🎯

## Requirements

This extension requires the [Go for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=golang.Go) extension to be installed.

## Future enhancements

- Should I look at integrating with VS Code's Test Explorer for a more native test running experience?

## Installation

You can install from [here](https://marketplace.visualstudio.com/items?itemName=timweightman.go-test-codelens-enhanced).

## Credits
Loosely based on the work of [takaaa220](https://github.com/takaaa220/test_name_finder) - thanks!

## License

[Apache License Version 2.0](../LICENSE)
