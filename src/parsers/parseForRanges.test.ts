import { test, expect } from 'vitest';
import * as fs from 'fs';
import { parseTestFuncs } from './parseTestFuncs';
import { parseForRanges } from './parseForRanges';

const testCases = [
  {
    testFuncName: "Test_PrimaryTestOnly",
    expected: []
  },
  {
    testFuncName: "Test_SubtestIsNotATableTest",
    expected: []
  },
  {
    testFuncName: "Test_ManyTestFuncs_TableIsMap",
    expected: [{
      keyVar: "k",
      valueVar: "v",
      rangeVar: "table",
      startLine: 27,
      endLine: 32
    }]
  },
  {
    testFuncName: "Test_ManyTestFuncs_TableIsSlice",
    expected: [
      {
        keyVar: "_",
        valueVar: "v",
        rangeVar: "table",
        startLine: 50,
        endLine: 55
      },
    ]
  },
  {
    testFuncName: "TestManyTestFuncsKitchenSinkCraziness",
    expected: [
      {
        keyVar: "k",
        valueVar: "v",
        rangeVar: "mTable",
        startLine: 94,
        endLine: 99
      },
      {
        keyVar: "_",
        valueVar: "v",
        rangeVar: "sTable",
        startLine: 101,
        endLine: 106,
      }
    ]
  }
] as const;

test.each(testCases)('should correctly parse for ranges in $testFuncName', ({ testFuncName, expected }) => {
  const content = fs.readFileSync('src/fixtures/fixture_test.go', 'utf-8');
  const testFuncs = parseTestFuncs(content);
  const testFunc = testFuncs.find(f => f.name === testFuncName);

  if (!testFunc) {
    throw new Error(`Test function ${testFuncName} not found`);
  }

  const actual = parseForRanges(content, testFunc);
  expect(actual).toEqual(expected);
});
