import * as vscode from "vscode";
import debugTest from "./debugTest";
import runTest from "./runTest";
import codelensProvider from "./codelensProvider";

export function activate(context: vscode.ExtensionContext) {
  runTest.register(context);
  debugTest.register(context);
  codelensProvider.register(context);
}

export function deactivate() {}
