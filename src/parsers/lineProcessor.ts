export interface ProcessedLine {
  processedLine: string;
  isInComment: boolean;
}

export interface LineProcessorOptions {
  stripSingleLineComments?: boolean;
  stripStrings?: boolean;
}

export class LineProcessor {
  private inComment = false;
  private stripSingleLineComments = true;
  private stripStrings = true;

  constructor({
    stripSingleLineComments = true,
    stripStrings = true,
  }: LineProcessorOptions = {}) {
    this.stripSingleLineComments = stripSingleLineComments;
    this.stripStrings = stripStrings;
  }

  processLine(line: string): ProcessedLine {
    // Handle multi-line comments
    if (line.includes('/*')) {
      this.inComment = true;
      return { processedLine: line, isInComment: true };
    }
    if (line.includes('*/')) {
      this.inComment = false;
      return { processedLine: line, isInComment: false };
    }
    if (this.inComment) {
      return { processedLine: line, isInComment: true };
    }

    let processedLine = line;

    if (this.stripSingleLineComments) {
      // Remove single-line comments
      processedLine = processedLine.replace(/\/\/.*$/, '');          // Remove single-line comments
    }

    if (this.stripStrings) {
      // Remove string literals
      processedLine = processedLine
        .replace(/"(?:\\"|[^"])*"/g, '') // Remove double-quoted strings
        .replace(/'(?:\\'|[^'])*'/g, '')  // Remove single-quoted strings
        .replace(/`(?:\\`|[^`])*`/g, '')  // Remove backtick strings
    }

    return { processedLine, isInComment: false };
  }
}
