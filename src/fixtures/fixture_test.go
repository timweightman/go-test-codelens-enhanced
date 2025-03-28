package fixtures

import (
	"fmt"
	"testing"
)

func Test_PrimaryTestOnly(t *testing.T) {
	t.Parallel()
	fmt.Println("primary test only")
}

func Test_SubtestIsNotATableTest(t *testing.T) {
	t.Parallel()
	t.Run("subtest is not a table test", func(t *testing.T) {
		t.Parallel()
		fmt.Println("subtest is not a table test")
	})
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
		stuff string
		value string
	}{
		{
			stuff: "test name one",
			value: "value1",
		},
		{
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
}

func TestManyTestFuncsKitchenSinkCraziness(t *testing.T) {
	type scenario struct{ mTable map[string]string }
	var mTable = map[string]scenario{
		// There are comments in here. {{{{
		"test name one": {
			mTable: map[string]string{
				"key1": "value1",
				"key2": "value2",
			},
		}, "test name two": {
			mTable: map[string]string{
				"key1": "value1",
				"key2": "value2",
			},
		},
	}
	sTable := []struct {
		name   string
		sTable []struct{ s string }
	}{
		{
			name: "test name one",
			sTable: []struct{ s string }{
				{s: "value1"},
				{s: "value2"},
			},
		},
		{
			name: "test name two",
			sTable: []struct{ s string }{
				{s: "value1"},
				{s: "value2"},
			},
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
			fmt.Println(v.name, v.sTable)
		})
	}
}
