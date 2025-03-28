import { test, expect } from 'vitest';
import * as fs from 'fs';
import { parseTestFuncs } from './parseTestFuncs';

test('should correctly parse test functions from fixture_test.go', () => {
  const expected = [
    { name: "Test_PrimaryTestOnly", startLine: 8, endLine: 11 },
    { name: "Test_SubtestIsNotATableTest", startLine: 13, endLine: 19 },
    { name: "Test_ManyTestFuncs_TableIsMap", startLine: 21, endLine: 33 },
    { name: "Test_ManyTestFuncs_TableIsSlice", startLine: 35, endLine: 56 },
    { name: "TestManyTestFuncsKitchenSinkCraziness", startLine: 58, endLine: 107 }
  ]

  const content = fs.readFileSync('src/fixtures/fixture_test.go', 'utf-8');
  const actual = parseTestFuncs(content);

  expect(actual).toEqual(expected);
});

