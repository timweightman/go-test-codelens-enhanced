import { parseForRanges } from "./parseForRanges";
import { parseTestFuncs, TestFunc } from "./parseTestFuncs";
import { parseTRunCalls } from "./parseTRunCalls";
import { parseDeclarationBlock, DeclarationBlock } from "./parseDeclarationBlock";
import { LineProcessor } from "./lineProcessor";

// This interface is the TypeScript counterpart to our Go AST test name finder output
export interface TestMeta {
  functionName: string;
  subTestName?: string;
  lineNumber: number;
}

export function parseTestMetas(src: string): TestMeta[] {
  const testMetas: TestMeta[] = [];

  for (const testFunc of parseTestFuncs(src)) {

    for (const forRange of parseForRanges(src, testFunc)) {
      const declarationBlock = parseDeclarationBlock(src, forRange.rangeVar, testFunc);
      if (!declarationBlock) continue

      if (declarationBlock.type === 'map') {
        testMetas.push(...parseTestMetasInMapDeclaration(src, declarationBlock, testFunc));
      } else if (declarationBlock.type === 'slice') {
        const tRunCalls = parseTRunCalls(src, forRange);
        testMetas.push(...tRunCalls.flatMap(tRunCall => parseTestMetasInSliceDeclaration(
          src,
          tRunCall.testNameVar,
          declarationBlock,
          testFunc
        )));
      }
    }
  }

  return applyDuplicateSuffixes(testMetas);
}

function applyDuplicateSuffixes(testMetas: TestMeta[]): TestMeta[] {
  const duplicateCounts = new Map<string, number>();

  return testMetas.map(meta => {
    const key = `${meta.functionName}/${meta.subTestName}`;
    let count = duplicateCounts.get(key)

    if (count === undefined) {
      // never seen this key before, so just track it and keep the original
      duplicateCounts.set(key, 0);
      return meta;
    }

    ++count;
    // must be a duplicate, so increment the duplicate count for this key
    duplicateCounts.set(key, count);

    const paddedCount = String(count).padStart(2, "0")
    return { ...meta, subTestName: `${meta.subTestName}#${paddedCount}` }
  })
}

function parseTestMetasInMapDeclaration(src: string, declarationBlock: DeclarationBlock, testFunc: TestFunc): TestMeta[] {
  // Split the declaration block into lines and process only the top level
  const lines = src.split('\n').slice(declarationBlock.startLine - 1, declarationBlock.endLine);

  // Track brace level to only match at top level
  let braceLevel = 0;
  const testMetas: TestMeta[] = [];
  const lineProcessor = new LineProcessor({
    stripStrings: false,
  });

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const { processedLine, isInComment } = lineProcessor.processLine(line);

    if (isInComment) {
      continue;
    }

    // This horrible thing gets a string literal "like this".
    // We're then optional-chaining to get the captured value without the quotes.
    const keyMatch = processedLine.match(/"([^"]+)"\s*:/)?.[1] || null;
    if (!keyMatch) {
      // Doesn't look like there's a possible subtest name on this line,
      // so we'll just adjust the brace level for the line and move on.
      const openBraces = (processedLine.match(/{/g) || []).length;
      const closeBraces = (processedLine.match(/}/g) || []).length;
      braceLevel += openBraces - closeBraces;
      // console.log(`${braceLevel} ${processedLine}`);
      continue;
    }

    // Get the open/close braces that occur ** before ** the keyMatch
    const beforeKeyMatch = processedLine.substring(0, processedLine.indexOf(keyMatch));
    const openBracesBeforeKeyMatch = (beforeKeyMatch.match(/{/g) || []).length;
    const closeBracesBeforeKeyMatch = (beforeKeyMatch.match(/}/g) || []).length;

    // Adjust the brace level for the beginning of the current line
    braceLevel += openBracesBeforeKeyMatch - closeBracesBeforeKeyMatch;

    // Only look for map keys at the top level (brace level 1) and nested maps (brace level 2)
    // We need to check the original line for the key name since processedLine strips strings
    if (braceLevel === 1) {
      const lineNumber = declarationBlock.startLine + i;

      testMetas.push({
        functionName: testFunc.name,
        subTestName: keyMatch,
        lineNumber
      });
    }

    // Get the open/close braces that occur ** after ** the keyMatch
    const afterKeyMatch = processedLine.substring(processedLine.indexOf(keyMatch) + keyMatch.length);
    const openBracesAfterKeyMatch = (afterKeyMatch.match(/{/g) || []).length;
    const closeBracesAfterKeyMatch = (afterKeyMatch.match(/}/g) || []).length;

    // Adjust the brace level for the end of the current line
    braceLevel += openBracesAfterKeyMatch - closeBracesAfterKeyMatch;

    // These logs are excellent for debugging:
    // console.log(`start open: ${openBracesBeforeKeyMatch}, close: ${closeBracesBeforeKeyMatch}`);
    // console.log(`${braceLevel} ${processedLine}`);
    // console.log(`end open: ${openBracesAfterKeyMatch}, close: ${closeBracesAfterKeyMatch}`);
  }

  return testMetas;
}

function parseTestMetasInSliceDeclaration(src: string, testNameVar: string, declarationBlock: DeclarationBlock, testFunc: TestFunc): TestMeta[] {
  // For slice declarations, look for struct field values
  const matches = declarationBlock.text.match(new RegExp(`${testNameVar}:\\s*"([^"]+)"`, 'g')) || [];

  return matches.reduce<TestMeta[]>((result, match) => {
    const valueMatch = match.match(/"([^"]+)"/);
    if (!valueMatch) return result

    return result.concat({
      functionName: testFunc.name,
      subTestName: valueMatch[1],
      lineNumber: findLineNumber(src, valueMatch[1], declarationBlock.startLine, declarationBlock.endLine)
    })
  }, [])
}

function findLineNumber(
  src: string,
  searchText: string,
  startLine: number,
  endLine: number
): number {
  const index = src.split('\n')
    .slice(startLine - 1, endLine)
    .findIndex(line => line.includes(searchText));

  return index === -1 ? startLine : startLine + index;
}
