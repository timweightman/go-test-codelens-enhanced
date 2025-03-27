package tests

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/timweightman/go-test-codelens-enhanced/gotestscraper"
)

func Test_Integration(t *testing.T) {
	pwd, err := os.Getwd()
	if err != nil {
		t.Fatalf("failed to get current working directory: %v", err)
	}

	cases := map[string]struct {
		filePath string
		want     []*gotestscraper.TestMeta
		wantErr  bool
	}{
		"failure_file_not_found": {
			filePath: filepath.Join(pwd, "testdata", "not_found.go"),
			wantErr:  true,
		},
		"success_table_is_map": {
			filePath: filepath.Join(pwd, "testdata", "table_is_map_test.go"),
			want: []*gotestscraper.TestMeta{
				{
					FunctionName: "Test_TableIsMap",
					SubTestName:  "test1",
					LineNumber:   19,
				},
				{
					FunctionName: "Test_TableIsMap",
					SubTestName:  "test2 test2",
					LineNumber:   26,
				},
			},
		},
		"success_table_is_slice": {
			filePath: filepath.Join(pwd, "testdata", "table_is_slice_test.go"),
			want: []*gotestscraper.TestMeta{
				{
					FunctionName: "Test_TableIsSlice",
					SubTestName:  "test1",
					LineNumber:   21,
				},
				{
					FunctionName: "Test_TableIsSlice",
					SubTestName:  "test2 test2",
					LineNumber:   29,
				},
			},
		},
		"success_table_is_not_supported_slice": {
			filePath: filepath.Join(pwd, "testdata", "table_is_not_supported_slice_test.go"),
			want: []*gotestscraper.TestMeta{
				{
					FunctionName: "Test_TableIsNotSupportedSlice",
					SubTestName:  "test1",
					LineNumber:   21,
				},
				{
					FunctionName: "Test_TableIsNotSupportedSlice",
					SubTestName:  "test2 test2",
					LineNumber:   29,
				},
			},
		},
		"success_file_has_many_testfuncs": {
			filePath: filepath.Join(pwd, "testdata", "many_testfuncs_test.go"),
			want: []*gotestscraper.TestMeta{
				{
					FunctionName: "Test_ManyTestFuncs_TableIsMap",
					SubTestName:  "test name one",
					LineNumber:   10,
				},
				{
					FunctionName: "Test_ManyTestFuncs_TableIsMap",
					SubTestName:  "test name two",
					LineNumber:   11,
				},
				{
					FunctionName: "Test_ManyTestFuncs_TableIsSlice",
					SubTestName:  "test name one",
					LineNumber:   28,
				},
				{
					FunctionName: "Test_ManyTestFuncs_TableIsSlice",
					SubTestName:  "test name two",
					LineNumber:   32,
				},
			},
		},
		"success_dogfooding_this_integration_test": {
			filePath: filepath.Join(pwd, "integration_test.go"),
			want: []*gotestscraper.TestMeta{
				{
					FunctionName: "Test_Integration",
					SubTestName:  "failure_file_not_found",
					LineNumber:   23,
				},
				{
					FunctionName: "Test_Integration",
					SubTestName:  "success_table_is_map",
					LineNumber:   27,
				},
				{
					FunctionName: "Test_Integration",
					SubTestName:  "success_table_is_slice",
					LineNumber:   42,
				},
				{
					FunctionName: "Test_Integration",
					SubTestName:  "success_table_is_not_supported_slice",
					LineNumber:   57,
				},
				{
					FunctionName: "Test_Integration",
					SubTestName:  "success_dogfooding_this_integration_test",
					LineNumber:   72,
				},
			},
		},
	}

	for name, tt := range cases {
		tt := tt
		t.Run(name, func(t *testing.T) {
			t.Parallel()

			out, err := gotestscraper.ScrapeAllTests(tt.filePath)
			if err != nil {
				if !tt.wantErr {
					t.Errorf("err should be nil, but got %v", err)
				}

				return
			}

			assert.ElementsMatch(t, out, tt.want)
		})
	}
}
