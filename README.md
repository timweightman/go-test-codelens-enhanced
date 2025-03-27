# Go Test CodeLens - Enhanced

A VS Code extension that enhances the Go testing experience by providing CodeLens support for running and debugging table-driven tests directly from your editor.

## CodeLens support for table-driven tests
Specialised CodeLens using Go's AST package to support the table-driven test pattern
- Includes both `Run test` and `Debug test` options for each scenario.

### 🗺️ Maps
![Run/Debug CodeLens for map table-driven tests](./map-table-test.png)

### 🍞 Slices
![Run/Debug CodeLens for slice table-driven tests](./slice-table-test.png)

### 🦹 What are you doing, you monster! (but it _does_ work) 🙈
![Run/Debug CodeLens for messy table-driven tests](./silly-double-table-test.png)

## How It Works
1. Open any Go test file (*_test.go)
1. Find any slice- or map-based table-driven tests
1. Look for the `Run test | Debug test` CodeLens above the test name
1. Click the one you want to do, celebrate! 🎉

## Requirements

This extension requires the [Go for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=golang.Go) extension to be installed.

## Future Enhancements

- Integration with VS Code's Test Explorer for a more native test running experience

## Installation

You can install from [here](https://marketplace.visualstudio.com/items?itemName=timweightman.go-test-codelens-enhanced).

## Credits
Based on the work of [takaaa220](https://github.com/takaaa220/test_name_finder)

## License

[Apache License Version 2.0](../LICENSE)
