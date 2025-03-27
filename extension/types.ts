
// This interface is the TypeScript counterpart to our Go AST test name finder output
export interface TestMeta {
  functionName: string;
  subTestName?: string;
  lineNumber: number;
}

export function isTestMeta(json: any): json is TestMeta {
  return json.functionName && json.lineNumber;
}

export function isTestMetaArray(json: any): json is TestMeta[] {
  return Array.isArray(json) && json.every(isTestMeta);
}
