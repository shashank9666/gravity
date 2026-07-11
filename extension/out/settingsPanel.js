"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsPanel = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
class SettingsPanel {
    static currentPanel;
    _panel;
    _disposables = [];
    constructor(panel, extensionUri) {
        this._panel = panel;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this._getWebviewContent(extensionUri);
    }
    static render(extensionUri) {
        if (SettingsPanel.currentPanel) {
            SettingsPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
        }
        else {
            const panel = vscode.window.createWebviewPanel('antigravitySettings', 'Antigravity Settings', vscode.ViewColumn.One, {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'webview-ui', 'build')]
            });
            SettingsPanel.currentPanel = new SettingsPanel(panel, extensionUri);
        }
    }
    dispose() {
        SettingsPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
    _getWebviewContent(extensionUri) {
        try {
            const indexPath = path.join(extensionUri.fsPath, 'webview-ui', 'build', 'index.html');
            const htmlContent = fs.readFileSync(indexPath, 'utf-8');
            return htmlContent;
        }
        catch (error) {
            console.error('Error reading index.html:', error);
            return `<!DOCTYPE html><html lang="en"><body><h1>Failed to load settings UI</h1></body></html>`;
        }
    }
}
exports.SettingsPanel = SettingsPanel;
//# sourceMappingURL=settingsPanel.js.map