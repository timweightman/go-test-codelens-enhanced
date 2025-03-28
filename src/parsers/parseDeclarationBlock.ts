import { TestFunc } from "./parseTestFuncs";
import { LineProcessor } from "./lineProcessor";

export interface DeclarationBlock {
  type: 'map' | 'slice';
  text: string;
  startLine: number;
  endLine: number;
}

export function parseDeclarationBlock(src: string, rangeVar: string, testFunc: TestFunc): DeclarationBlock | null {
  const lines = src.split('\n');
  const lineProcessor = new LineProcessor();
  let type: 'map' | 'slice' | null = null;
  let text = '';
  let startLine = 0;
  let endLine = 0;
  let braceCount = 0;

  for (let i = testFunc.startLine - 1; i < testFunc.endLine; i++) {
    const line = lines[i];
    const { processedLine, isInComment } = lineProcessor.processLine(line);

    if (isInComment) continue;

    // Match either:
    // - var rangeVar = map[
    // - var rangeVar = []
    // - rangeVar := map[
    // - rangeVar := []
    const match = processedLine.match(new RegExp(`(?:var\\s+${rangeVar}\\s*=|${rangeVar}\\s*:=)\\s*(map\\[|\\[\\])`))
    if (match) {
      type = match[1] === 'map[' ? 'map' : 'slice'
      startLine = i + 1;
      text = line;
      braceCount = (processedLine.match(/{/g) || []).length;
    } else if (startLine > 0) {
      text += '\n' + line;
      braceCount += (processedLine.match(/{/g) || []).length;
      braceCount -= (processedLine.match(/}/g) || []).length;

      if (braceCount === 0) {
        endLine = i + 1;
        break;
      }
    }
  }

  // Only makes sense if we got all the parts we want... otherwise just ignore it
  if (type && text && startLine && endLine) {
    return { type, text, startLine, endLine };
  }

  return null;
}
