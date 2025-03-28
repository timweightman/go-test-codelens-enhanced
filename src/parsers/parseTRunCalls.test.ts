import { test, expect } from 'vitest';
import * as fs from 'fs';
import { parseTRunCalls, TRunCall } from './parseTRunCalls';
import { parseTestFuncs } from './parseTestFuncs';
import { parseForRanges } from './parseForRanges';

const testCases = [
  {
    testFuncName: 'Test_SubtestIsNotATableTest',
    expected: []
  },
  {
    testFuncName: 'Test_PrimaryTestOnly',
    expected: []
  },
  {
    testFuncName: 'Test_ManyTestFuncs_TableIsMap',
    expected: [{
      testNameVar: 'k',
      startLine: 28,
      endLine: 31
    }]
  },
  {
    testFuncName: 'Test_ManyTestFuncs_TableIsSlice',
    expected: [
      {
        testNameVar: 'stuff',
        startLine: 51,
        endLine: 54,
      },
    ]
  },
  {
    testFuncName: 'TestManyTestFuncsKitchenSinkCraziness',
    expected: [
      {
        testNameVar: 'k',
        startLine: 95,
        endLine: 98
      },
      {
        testNameVar: 'name',
        startLine: 102,
        endLine: 105
      }
    ]
  }
] as const;

test.each(testCases)('should correctly parse t.Run calls from test function $testFuncName in fixture_test.go', ({ testFuncName, expected }) => {
  const content = fs.readFileSync('src/fixtures/fixture_test.go', 'utf-8');
  const testFuncs = parseTestFuncs(content);
  const testFunc = testFuncs.find(f => f.name === testFuncName);
  if (!testFunc) {
    throw new Error(`Test function ${testFuncName} not found`);
  }
  const forRanges = parseForRanges(content, testFunc);

  const actual = forRanges.flatMap(range => parseTRunCalls(content, range));

  expect(actual).toEqual(expected);
});
