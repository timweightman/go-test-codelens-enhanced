import * as vscode from "vscode";
import { CodelensProvider } from "./CodelensProvider";
import { TestMeta } from "./types";

export async function executeTest(test?: TestMeta) {
  if (!test) {
    vscode.window.showErrorMessage("no tests found");
    return;
  }

  const { functionName, subTestName } = test;

  // see:
  // - https://github.com/golang/vscode-go/blob/d6fb20289a8484e57dc4fa21a2f44094de7f1a5b/src/goRunTestCodelens.ts#L134-L138
  // - https://github.com/golang/vscode-go/blob/master/src/goTest.ts#L234-L246
  if (subTestName) {
    vscode.window.setStatusBarMessage(`Running "${subTestName}" in "${functionName}"`, 5000);
    vscode.commands.executeCommand("go.subtest.cursor", {
      functionName: functionName,
      subTestName: subTestName,
    });
  } else {
    vscode.window.setStatusBarMessage(`Running tests in "${functionName}"`, 5000);
    vscode.commands.executeCommand("go.test.cursor", {
      functionName: functionName
    });
  }
}

export async function debugTest(test?: TestMeta) {
  if (!test) {
    vscode.window.showErrorMessage("no tests found");
    return;
  }

  const { functionName, subTestName } = test;

  // see:
  // - https://github.com/golang/vscode-go/blob/d6fb20289a8484e57dc4fa21a2f44094de7f1a5b/src/goRunTestCodelens.ts#L134-L138
  // - https://github.com/golang/vscode-go/blob/master/src/goTest.ts#L234-L246
  if (subTestName) {
    vscode.window.setStatusBarMessage(`Debugging "${subTestName}" in "${functionName}"`, 5000);
    vscode.commands.executeCommand("go.debug.subtest.cursor", {
      functionName: functionName,
      subTestName: subTestName,
    });
  } else {
    vscode.window.setStatusBarMessage(`Debugging tests in "${functionName}"`, 5000);
    vscode.commands.executeCommand("go.debug.cursor", {
      functionName: functionName
    });
  }
}

export function activate(context: vscode.ExtensionContext) {
	vscode.languages.registerCodeLensProvider(
    { pattern: "**/*_test.go", language: "go" },
    new CodelensProvider(context)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "go-test-codelens-enhanced.debug",
      debugTest
    ),
    vscode.commands.registerCommand(
      "go-test-codelens-enhanced.exec",
      executeTest
    )
  );
}

export function deactivate() {}
