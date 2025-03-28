import * as vscode from "vscode";
import { TestMeta } from "./parsers/parseTestMetas";

async function debugTest(test?: TestMeta) {
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

const command = "go-test-codelens-enhanced.debug";
function register(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(command, debugTest)
  );
}

export default { register, command };
