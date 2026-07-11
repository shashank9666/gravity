"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const chatSidebarProvider_1 = require("./ui/sidebar/chatSidebarProvider");
let backendProcess;
function activate(context) {
    const provider = new chatSidebarProvider_1.ChatSidebarProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(chatSidebarProvider_1.ChatSidebarProvider.viewType, provider));
}
function deactivate() {
    if (backendProcess) {
        backendProcess.kill();
    }
}
//# sourceMappingURL=extension.js.map