import { LineProcessor } from "./lineProcessor";
import { ForRange } from "./parseForRanges";

export interface TRunCall {
  testNameVar: string;
  startLine: number;
  endLine: number;
}

export function parseTRunCalls(src: string, forRange: ForRange): TRunCall[] {
  const lines = src.split('\n');
  const tRunCalls: TRunCall[] = [];
  let currentTRun: TRunCall | null = null;
  let braceLevel = 0;
  const lineProcessor = new LineProcessor();

  // Only process lines within the for range
  for (let i = forRange.startLine - 1; i < forRange.endLine; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    const { processedLine, isInComment } = lineProcessor.processLine(line);

    if (isInComment) {
      continue;
    }

    // Look for t.Run calls that start with a variable name
    const tRunMatch = processedLine.match(/t\.Run\s*\(\s*([a-zA-Z0-9_\.]+)/);
    if (tRunMatch) {
      const [, variableName] = tRunMatch;

      let testNameVar = variableName;
      if (
        testNameVar.startsWith(`${forRange.keyVar}.`) ||
        testNameVar.startsWith(`${forRange.valueVar}.`)
      ) {
        // Remove the variable prefix
        testNameVar = testNameVar
          .replace(`${forRange.keyVar}.`, '')
          .replace(`${forRange.valueVar}.`, '');
      }

      currentTRun = {
        testNameVar,
        startLine: lineNumber,
        endLine: lineNumber
      };
      braceLevel = 0;
    }

    // Only process braces if we're tracking a t.Run call
    if (currentTRun) {
      // Count braces in the processed line
      const openBraces = (processedLine.match(/{/g) || []).length;
      const closeBraces = (processedLine.match(/}/g) || []).length;
      braceLevel += openBraces - closeBraces;

      // If we've closed all braces and we've seen at least one opening brace,
      // this is the end of the t.Run call
      if (braceLevel === 0 && (openBraces > 0 || closeBraces > 0)) {
        currentTRun.endLine = lineNumber;
        tRunCalls.push(currentTRun);
        currentTRun = null;
      }
    }
  }

  return tRunCalls;
}
