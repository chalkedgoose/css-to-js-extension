"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const convert_1 = require("./convert");
const postcss = require("postcss");
function activate(context) {
    let disposable = vscode.commands.registerCommand("css-to-js.cssToJs", () => {
        const editor = vscode.window.activeTextEditor;
        const txt = editor === null || editor === void 0 ? void 0 : editor.document.getText(editor.selection);
        if (txt) {
            const parsed = postcss([convert_1.default()]).process(txt.toString());
            vscode.env.clipboard.writeText(parsed.toString()).then(() => {
                vscode.window.showInformationMessage("Converted JS Copied to Clipboard.");
            }, (err) => {
                vscode.window.showInformationMessage(err);
            });
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map