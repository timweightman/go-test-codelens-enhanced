import { TestFunc } from "./parseTestFuncs";
import { LineProcessor } from "./lineProcessor";

export interface DeclarationBlock {
  text: string;
  startLine: number;
  endLine: number;
}

export function parseDeclarationBlock(src: string, rangeVar: string, testFunc: TestFunc): DeclarationBlock | null {
  const lines = src.split('\n');
  const lineProcessor = new LineProcessor();
  let text = '';
  let startLine = 0;
  let braceCount = 0;

  for (let i = testFunc.startLine - 1; i < testFunc.endLine; i++) {
    const line = lines[i];
    const { processedLine, isInComment } = lineProcessor.processLine(line);

    if (isInComment) continue;

    if (processedLine.match(new RegExp(`(?:var\\s+${rangeVar}|${rangeVar}\\s*:=)\\s*`))) {
      startLine = i + 1;
      text = line;
      braceCount = (processedLine.match(/{/g) || []).length;
    } else if (startLine > 0) {
      text += '\n' + line;
      braceCount += (processedLine.match(/{/g) || []).length;
      braceCount -= (processedLine.match(/}/g) || []).length;

      if (braceCount === 0) {
        return { text, startLine, endLine: i + 1 };
      }
    }
  }
  return null;
}
