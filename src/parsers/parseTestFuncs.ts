import { LineProcessor } from "./lineProcessor";

export interface TestFunc {
  name: string;
  startLine: number;
  endLine: number;
}

export function parseTestFuncs(src: string): TestFunc[] {
  const lines = src.split('\n');
  const testFuncs: TestFunc[] = [];
  let currentFunc: TestFunc | null = null;
  let braceLevel = 0;
  const lineProcessor = new LineProcessor();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    const { processedLine, isInComment } = lineProcessor.processLine(line);

    if (isInComment) {
      continue;
    }

    // Check for test function declaration
    const testFuncMatch = line.match(/^[\t ]*func[\t ]+(Test[A-Za-z0-9_]+)[\t ]*\(/);
    if (testFuncMatch) {
      if (currentFunc) {
        testFuncs.push(currentFunc);
      }
      currentFunc = {
        name: testFuncMatch[1],
        startLine: lineNumber,
        endLine: lineNumber
      };
      braceLevel = 0;
    }

    // Only process braces if we're tracking a function
    if (currentFunc) {
      // Count braces in the processed line
      const openBraces = (processedLine.match(/{/g) || []).length;
      const closeBraces = (processedLine.match(/}/g) || []).length;
      braceLevel += openBraces - closeBraces;

      // If we've closed all braces and we've seen at least one opening brace,
      // this is the end of the function
      if (braceLevel === 0 && (openBraces > 0 || closeBraces > 0)) {
        currentFunc.endLine = lineNumber;
      }
    }
  }

  // Add the last function if it exists
  if (currentFunc) {
    testFuncs.push(currentFunc);
  }

  return testFuncs;
}
