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

test("broken test", () => {
  const expected = [
    {
      "functionName": "TestGetPercentageScore",
      "lineNumber": 19,
      "subTestName": "empty SurveyAnswerRisks should return a score of 0",
    },
    {
      "functionName": "TestGetPercentageScore",
      "lineNumber": 24,
      "subTestName": "perfect SurveyAnswerRisks should return a score of 1",
    },
    {
      "functionName": "TestGetPercentageScore",
      "lineNumber": 34,
      "subTestName": "fully waived SurveyAnswerRisks should return a score of 1",
    },
    {
      "functionName": "TestGetPercentageScore",
      "lineNumber": 45,
      "subTestName": "partially waived SurveyAnswerRisks should return adjusted score",
    },
    {
      "functionName": "TestGetPercentageScore",
      "lineNumber": 56,
      "subTestName": "adjusted SurveyAnswerRisks should return adjusted score",
    },
    {
      "functionName": "TestGetPercentageScore",
      "lineNumber": 70,
      "subTestName": "single SurveyAnswerRisks should return as expected",
    },
    {
      "functionName": "TestGetPercentageScore",
      "lineNumber": 80,
      "subTestName": "the same risk severities should be weighted equally",
    },
    {
      "functionName": "TestGetPercentageScore",
      "lineNumber": 90,
      "subTestName": "different risk severities should be weighted appropriately",
    },
  ]
  const content = fs.readFileSync('src/fixtures/broken_test_1.go', 'utf-8');
  const actual = parseTestMetas(content);
  expect(actual).toEqual(expected);
});
