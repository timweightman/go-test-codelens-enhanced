import { test, expect } from 'vitest';
import * as fs from 'fs';
import { parseTestMetas } from './parseTestMetas';

test('should correctly parse test metas from fixture_test.go', () => {
  const expected = [
    {
      functionName: "Test_ManyTestFuncs_TableIsMap",
      subTestName: "test name one",
      lineNumber: 23
    },
    {
      functionName: "Test_ManyTestFuncs_TableIsMap",
      subTestName: "test name two",
      lineNumber: 24
    },
    {
      functionName: "Test_ManyTestFuncs_TableIsSlice",
      subTestName: "test name one",
      lineNumber: 41
    },
    {
      functionName: "Test_ManyTestFuncs_TableIsSlice",
      subTestName: "test name two",
      lineNumber: 45
    },
    {
      functionName: "TestManyTestFuncsKitchenSinkCraziness",
      subTestName: "test name one",
      lineNumber: 62
    },
    {
      functionName: "TestManyTestFuncsKitchenSinkCraziness",
      subTestName: "test name two",
      lineNumber: 67
    },
    {
      functionName: "TestManyTestFuncsKitchenSinkCraziness",
      subTestName: "test name one#01",
      lineNumber: 79
    },
    {
      functionName: "TestManyTestFuncsKitchenSinkCraziness",
      subTestName: "test name two#01",
      lineNumber: 86
    }
  ]

  const content = fs.readFileSync('src/fixtures/fixture_test.go', 'utf-8');
  const actual = parseTestMetas(content);
  expect(actual).toEqual(expected);
});
