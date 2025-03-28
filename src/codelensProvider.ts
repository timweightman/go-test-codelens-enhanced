import * as vscode from 'vscode';
import { parseTestMetas, TestMeta } from './parsers/parseTestMetas';
import runTest from './runTest';
import debugTest from './debugTest';

class CodelensProvider implements vscode.CodeLensProvider {
  private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

  private _context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext, fileNameSuffix: string) {
    this._context = context;

    // When configuration changes, update code lenses
    vscode.workspace.onDidChangeConfiguration((_) => {
      this._onDidChangeCodeLenses.fire();
    });

    // When a text document changes, update code lenses
    // if the file name matches the suffix
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.document.uri.fsPath.endsWith(fileNameSuffix)) {
        this._onDidChangeCodeLenses.fire();
      }
    });
  }

  public resolveCodeLens(codeLens: vscode.CodeLens, _: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens> {
    return codeLens;
  }

  public async provideCodeLenses(document: vscode.TextDocument, _: vscode.CancellationToken): Promise<vscode.CodeLens[]> {
    const extensionPath = this._context.extensionPath
    if (!extensionPath) {
      return [];
    }

    try {
      return parseTestMetas(document.getText()).flatMap((testMeta: TestMeta) => {
        const line = document.lineAt(testMeta.lineNumber - 1)
        const range = new vscode.Range(line.range.start, line.range.end)

        return [
          new vscode.CodeLens(range, {
            title: 'run test',
            command: runTest.command,
            arguments: [testMeta]
          }),
          new vscode.CodeLens(range, {
            title: 'debug test',
            command: debugTest.command,
            arguments: [testMeta]
          })
        ];
      }, []);
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}

function register(context: vscode.ExtensionContext) {
  const fileNameSuffix = "_test.go";
  const options = { pattern: `**/*${fileNameSuffix}`, language: "go" };

  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(options, new CodelensProvider(context, fileNameSuffix))
  );
}


export default { register };
