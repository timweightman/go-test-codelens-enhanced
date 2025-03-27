package gotestscraper

import (
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"log"
	"strings"
)

type LogLevel int

const (
	// LogLevelDebug is the debug level
	LogLevelDebug LogLevel = iota
	// LogLevelNone is the none level
	LogLevelNone
)

var logLevel = LogLevelNone

// SetLogLevel sets the log level
func SetLogLevel(level LogLevel) {
	logLevel = level
}

// debug only prints a message if the log level is debug or below
func debug(format string, v ...any) {
	if logLevel <= LogLevelDebug {
		log.Printf(format, v...)
	}
}

// TestMeta represents a test name with its wrapping test function, line number, start and end character position
type TestMeta struct {
	FunctionName string `json:"functionName"`
	SubTestName  string `json:"subTestName,omitempty"`
	LineNumber   int    `json:"lineNumber"`
}

// String returns a string representation of the test name
func (t TestMeta) String() string {
	if t.SubTestName == "" {
		return t.FunctionName
	}

	return fmt.Sprintf("%s/%s", t.FunctionName, t.SubTestName)
}

type testNameWithLine struct {
	name    string
	lineNum int
}

// testNameKey represents a unique key for a test name without line number
type testNameKey struct {
	functionName string
	subTestName  string
}

// ScrapeAllTests - Given a file path, find all test names in the file.
func ScrapeAllTests(filePath string) ([]*TestMeta, error) {
	fset := token.NewFileSet()
	fileNode, err := parser.ParseFile(fset, filePath, nil, parser.ParseComments)
	if err != nil {
		return nil, fmt.Errorf("failed to parse file: %w", err)
	}

	testFuncs := findPrimaryTestFunctions(fileNode)
	testNames := []*TestMeta{}

	// Track duplicate test names and their counts
	duplicateCount := map[testNameKey]int{}

	for _, testFunc := range testFuncs {
		rangeStmts := findRangeStatements(testFunc)

		for _, rangeStmt := range rangeStmts {
			rangeIdent, ok := rangeStmt.X.(*ast.Ident)
			if !ok {
				continue
			}

			// t.Run calls for table tests take the forms:
			// 	t.Run(mapKeyTestName, ...)
			// 	t.Run(sliceElement.testNameProperty, ...)
			// This helper function plucks out those arg names, e.g.
			// 	mapKeyTestName
			// 	testNameProperty
			testRunNameArgs := findTestRunNameArgsInRange(rangeStmt)
			if len(testRunNameArgs) == 0 {
				continue
			}

			// Here we find the declaration of the actual test cases slice / map.
			// We'll traverse inside that declaration to find the actual test name literals
			// that are either map keys, or slice element property values.
			casesDecl := findCasesDeclaration(testFunc, rangeIdent.Name)
			if casesDecl == nil {
				continue
			}

			for _, testNameArg := range testRunNameArgs {
				// Okay, casesDecl is either a slice or a map. testNameArg is only really
				// useful for slices, to access the correct property name in each slice element.
				// For maps, we will just read the map keys directly - but the helper will take
				// care of that detail for us.
				cases := extractTableTestNamesFromDeclaration(casesDecl, testNameArg, fset)
				for _, scenario := range cases {
					key := testNameKey{
						functionName: testFunc.Name.Name,
						subTestName:  scenario.name,
					}

					// If this is a duplicate, append the index to the subtest name
					subTestName := scenario.name
					if _, ok := duplicateCount[key]; ok {
						// Found the test key already... so this one is a duplicate.
						// Increment the duplicate count for this test key.
						duplicateCount[key]++
						subTestName = fmt.Sprintf("%s#%02d", scenario.name, duplicateCount[key])
					} else {
						// This is the first time we have seen this test key.
						// Initialize the duplicate count for this test key.
						duplicateCount[key] = 0
					}

					testNames = append(testNames, &TestMeta{
						FunctionName: testFunc.Name.Name,
						SubTestName:  subTestName,
						LineNumber:   scenario.lineNum,
					})
				}
			}
		}
	}

	debug("Found %d test names\n", len(testNames))
	return testNames, nil
}

// findPrimaryTestFunctions finds all test functions in the file
func findPrimaryTestFunctions(fileNode *ast.File) []*ast.FuncDecl {
	var testFuncs []*ast.FuncDecl

	ast.Inspect(fileNode, func(n ast.Node) bool {
		funcDecl, ok := n.(*ast.FuncDecl)
		if !ok || !strings.HasPrefix(funcDecl.Name.Name, "Test") {
			return true
		}
		testFuncs = append(testFuncs, funcDecl)
		return true
	})

	return testFuncs
}

// findRangeStatements finds all range statements in a function
func findRangeStatements(funcDecl *ast.FuncDecl) []*ast.RangeStmt {
	var rangeStmts []*ast.RangeStmt

	ast.Inspect(funcDecl, func(n ast.Node) bool {
		rangeStmt, ok := n.(*ast.RangeStmt)
		if !ok {
			return true
		}
		rangeStmts = append(rangeStmts, rangeStmt)
		return true
	})

	return rangeStmts
}

// findTestRunNameArgsInRange finds all t.Run calls with Ident or SelectorExpr arguments within a range statement
func findTestRunNameArgsInRange(rangeStmt *ast.RangeStmt) []string {
	var runCalls []string

	ast.Inspect(rangeStmt, func(n ast.Node) bool {
		callExpr, ok := n.(*ast.CallExpr)
		if !ok {
			return true
		}

		selectorExpr, ok := callExpr.Fun.(*ast.SelectorExpr)
		if !ok || selectorExpr.Sel.Name != "Run" {
			return true
		}

		if len(callExpr.Args) == 0 {
			return true
		}

		// Skip basic literals
		switch arg := callExpr.Args[0].(type) {
		case *ast.BasicLit:
			return true
		case *ast.Ident:
			runCalls = append(runCalls, arg.Name)
		case *ast.SelectorExpr:
			runCalls = append(runCalls, arg.Sel.Name)
		}
		return true
	})

	return runCalls
}

// findCasesDeclaration finds the declaration of test cases for a given range variable within a specific function
func findCasesDeclaration(funcDecl *ast.FuncDecl, rangeIdentName string) *ast.AssignStmt {
	for _, stmt := range funcDecl.Body.List {
		assignStmt, ok := stmt.(*ast.AssignStmt)
		if !ok {
			continue
		}

		if len(assignStmt.Lhs) == 0 {
			continue
		}

		ident, ok := assignStmt.Lhs[0].(*ast.Ident)
		if !ok || ident.Name != rangeIdentName {
			continue
		}

		debug("Found cases declaration for variable: %s\n", ident.Name)
		return assignStmt
	}
	return nil
}

// extractTableTestNamesFromDeclaration extracts test names from a declaration of test cases
func extractTableTestNamesFromDeclaration(casesDecl *ast.AssignStmt, propertyName string, fset *token.FileSet) []testNameWithLine {
	var testNames []testNameWithLine
	compositeLit, ok := casesDecl.Rhs[0].(*ast.CompositeLit)
	if !ok {
		debug("Failed to get composite literal from cases declaration\n")
		return testNames
	}

	var litType string
	isMap := false
	switch compositeLit.Type.(type) {
	case *ast.MapType:
		isMap = true
		litType = "map"
	case *ast.ArrayType:
		litType = "slice"
	default:
		debug("Unknown composite literal type\n")
		return testNames
	}

	debug("Processing %s composite literal with %d elements\n", litType, len(compositeLit.Elts))
	if isMap {
		for _, elt := range compositeLit.Elts {
			names := extractTestNamesFromMapElement(elt, fset)
			testNames = append(testNames, names...)
		}
	} else {
		for _, elt := range compositeLit.Elts {
			names := extractTestNamesFromSliceElement(elt, propertyName, fset)
			testNames = append(testNames, names...)
		}
	}
	return testNames
}

// extractTestNamesFromMapElement extracts test names from a map element
func extractTestNamesFromMapElement(elt ast.Expr, fset *token.FileSet) []testNameWithLine {
	var testNames []testNameWithLine
	keyValueExpr, ok := elt.(*ast.KeyValueExpr)
	if !ok {
		debug("Failed to get key value expression from map\n")
		return testNames
	}

	basicLit, ok := keyValueExpr.Key.(*ast.BasicLit)
	if !ok || basicLit.Kind != token.STRING {
		debug("Failed to get string literal from map key\n")
		return testNames
	}

	debug("Found test name from map key: %s\n", basicLit.Value)
	testNames = append(testNames, testNameWithLine{
		name:    strings.Trim(basicLit.Value, "\""),
		lineNum: fset.Position(basicLit.Pos()).Line,
	})
	return testNames
}

// extractTestNamesFromSliceElement extracts test names from a slice element
func extractTestNamesFromSliceElement(elt ast.Expr, propertyName string, fset *token.FileSet) []testNameWithLine {
	var testNames []testNameWithLine
	nestedCompositeLit, ok := elt.(*ast.CompositeLit)
	if !ok {
		debug("Failed to get nested composite literal\n")
		return testNames
	}

	debug("Processing nested composite literal with %d elements\n", len(nestedCompositeLit.Elts))
	for _, nestedElt := range nestedCompositeLit.Elts {
		keyValueExpr, ok := nestedElt.(*ast.KeyValueExpr)
		if !ok {
			debug("Failed to get key value expression from nested composite literal\n")
			continue
		}

		keyIdent, ok := keyValueExpr.Key.(*ast.Ident)
		if !ok || keyIdent.Name != propertyName {
			debug("Failed to get key ident from key value expression\n")
			continue
		}

		basicLit, ok := keyValueExpr.Value.(*ast.BasicLit)
		if !ok || basicLit.Kind != token.STRING {
			debug("Failed to get basic lit from key value expression\n")
			continue
		}

		debug("Found test name: %s\n", basicLit.Value)
		testNames = append(testNames, testNameWithLine{
			name:    strings.Trim(basicLit.Value, "\""),
			lineNum: fset.Position(basicLit.Pos()).Line,
		})
	}
	return testNames
}
