import * as vscode from 'vscode';
import { exec } from "child_process";
import { promisify } from "util";
import { join } from 'path';
import { isTestMetaArray, TestMeta as TestMeta } from './types';

const execAsync = promisify(exec);

export class CodelensProvider implements vscode.CodeLensProvider {
  private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

  private _context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this._context = context;

    vscode.workspace.onDidChangeConfiguration((_) => {
      this._onDidChangeCodeLenses.fire();
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

    const binaryPath = join(
      extensionPath,
      "out/bin/gotestscraper"
    );

    try {
      const {stderr, stdout} = await execAsync(`${binaryPath} -f ${document.fileName}`)
      if (stderr) {
        console.error(stderr);
        return [];
      }

      const testMetas = JSON.parse(stdout);
      if (!isTestMetaArray(testMetas)) {
        return [];
      }

      return testMetas.reduce((codeLenses: vscode.CodeLens[], testMeta: TestMeta) => {
        const line = document.lineAt(testMeta.lineNumber - 1)
        const range = new vscode.Range(
          line.range.start,
          line.range.end
        );

        return [
          ...codeLenses,
          new vscode.CodeLens(range, {
            command: 'go-test-codelens-enhanced.exec',
            title: 'run test',
            arguments: [testMeta]
          }),
          new vscode.CodeLens(range, {
            command: 'go-test-codelens-enhanced.debug',
            title: 'debug test',
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
