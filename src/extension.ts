// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import actualCssToJs from "./convert";
import postcss = require("postcss");

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("css-to-js.cssToJs", () => {
    const editor = vscode.window.activeTextEditor;
    const txt = editor?.document.getText(editor.selection);
    if (txt) {
      const parsed = postcss([actualCssToJs()]).process(txt.toString());
      vscode.env.clipboard.writeText(parsed.toString()).then(
        () => {
          vscode.window.showInformationMessage(
            "Converted JS Copied to Clipboard."
          );
        },
        (err) => {
          vscode.window.showInformationMessage(err);
        }
      );
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
