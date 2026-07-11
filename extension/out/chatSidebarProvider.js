"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSidebarProvider = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
class ChatSidebarProvider {
    _extensionUri;
    static viewType = 'gravityChatView';
    _view;
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this._extensionUri, 'webview-ui', 'build')
            ]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage((data) => {
            // Handle messages from the webview to the extension if needed
        });
    }
    _getHtmlForWebview(webview) {
        try {
            const indexPath = path.join(this._extensionUri.fsPath, 'webview-ui', 'build', 'index.html');
            const htmlContent = fs.readFileSync(indexPath, 'utf-8');
            return htmlContent;
        }
        catch (error) {
            console.error('Error reading index.html:', error);
            return `<!DOCTYPE html><html lang="en"><body><h1>Failed to load Gravity UI</h1></body></html>`;
        }
    }
}
exports.ChatSidebarProvider = ChatSidebarProvider;
//# sourceMappingURL=chatSidebarProvider.js.map