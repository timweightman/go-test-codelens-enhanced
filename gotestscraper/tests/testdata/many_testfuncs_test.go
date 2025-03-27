package testdata

import (
	"fmt"
	"testing"
)

func Test_SubtestIsNotATableTest(t *testing.T) {
	t.Parallel()
	t.Run("subtest is not a table test", func(t *testing.T) {
		t.Parallel()
		fmt.Println("subtest is not a table test")
	})
}

func Test_PrimaryTestOnly(t *testing.T) {
	t.Parallel()
	fmt.Println("primary test only")
}

func Test_ManyTestFuncs_TableIsMap(t *testing.T) {
	table := map[string]string{
		"test name one": "value1",
		"test name two": "value2",
	}

	for k, v := range table {
		t.Run(k, func(t *testing.T) {
			t.Parallel()
			fmt.Println(k, v)
		})
	}
}

func Test_ManyTestFuncs_TableIsSlice(t *testing.T) {
	table := []struct {
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

	for _, v := range table {
		t.Run(v.name, func(t *testing.T) {
			t.Parallel()
			fmt.Println(v.name, v.value)
		})
	}
}

func Test_ManyTestFuncs_KitchenSinkCraziness(t *testing.T) {
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
}
