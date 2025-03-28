import { TestFunc } from "./parseTestFuncs";
import { LineProcessor } from "./lineProcessor";

export interface ForRange {
  keyVar: string;
  valueVar: string;
  rangeVar: string;
  startLine: number;
  endLine: number;
}

export function parseForRanges(src: string, testFunc: TestFunc): ForRange[] {
  const lines = src.split('\n');
  const forRanges: ForRange[] = [];
  let currentForRange: ForRange | null = null;
  let braceLevel = 0;
  const lineProcessor = new LineProcessor();

  // Only process lines within the test function's range
  for (let i = testFunc.startLine - 1; i < testFunc.endLine; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    const { processedLine, isInComment } = lineProcessor.processLine(line);

    if (isInComment) {
      continue;
    }

    // Look for for...range statements
    const forRangeMatch = processedLine.match(/for\s+(?:(\w+)\s*,\s*)?(\w+)\s*:=\s*range\s+(\w+)/);
    if (forRangeMatch) {
      const [, keyVar, valueVar, rangeVar] = forRangeMatch;
      currentForRange = {
        keyVar: keyVar || '',
        valueVar,
        rangeVar,
        startLine: lineNumber,
        endLine: lineNumber
      };
      braceLevel = 0;
    }

    // Only process braces if we're tracking a for loop
    if (currentForRange) {
      // Count braces in the processed line
      const openBraces = (processedLine.match(/{/g) || []).length;
      const closeBraces = (processedLine.match(/}/g) || []).length;
      braceLevel += openBraces - closeBraces;

      // If we've closed all braces and we've seen at least one opening brace,
      // this is the end of the for loop
      if (braceLevel === 0 && (openBraces > 0 || closeBraces > 0)) {
        currentForRange.endLine = lineNumber;
        forRanges.push(currentForRange);
        currentForRange = null;
      }
    }
  }

  return forRanges;
}
