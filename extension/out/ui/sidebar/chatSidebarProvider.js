"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSidebarProvider = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const Agent_1 = require("../../core/agent/Agent");
const OpenAIProvider_1 = require("../../core/providers/OpenAIProvider");
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
        webviewView.webview.onDidReceiveMessage(async (data) => {
            if (data.type === 'sendMessage') {
                await this._handleChatRequest(data.text, webviewView.webview);
            }
            else if (data.type === 'getSettings') {
                this._sendSettingsToWebview(webviewView.webview);
            }
            else if (data.type === 'updateSetting') {
                const config = vscode.workspace.getConfiguration('gravity');
                await config.update(data.key, data.value, vscode.ConfigurationTarget.Global);
            }
        });
    }
    async _handleChatRequest(userMessage, webview) {
        const config = vscode.workspace.getConfiguration('gravity');
        const providerConfig = {
            endpoint: config.get('apiEndpoint'),
            apiKey: config.get('apiKey'),
            model: config.get('model')
        };
        try {
            const provider = new OpenAIProvider_1.OpenAIProvider(providerConfig);
            const agent = new Agent_1.Agent(provider);
            // Send initial empty response so UI creates bubble
            webview.postMessage({ type: 'agentResponse', text: '', new: true });
            await agent.executeTask(userMessage, (chunk) => {
                webview.postMessage({
                    type: 'agentResponseChunk',
                    text: chunk
                });
            });
            webview.postMessage({ type: 'agentResponseDone' });
        }
        catch (error) {
            webview.postMessage({
                type: 'agentError',
                text: `Error connecting to provider: ${error.message}. Check your settings.`
            });
        }
    }
    _sendSettingsToWebview(webview) {
        const config = vscode.workspace.getConfiguration('gravity');
        webview.postMessage({
            type: 'settingsSync',
            settings: {
                apiEndpoint: config.get('apiEndpoint'),
                apiKey: config.get('apiKey'),
                model: config.get('model'),
                securityMode: config.get('securityMode'),
                terminalAutoExecute: config.get('terminalAutoExecute'),
                enableShellIntegration: config.get('enableShellIntegration'),
                nonWorkspaceFileAccess: config.get('nonWorkspaceFileAccess'),
                autoOpenEditedFiles: config.get('autoOpenEditedFiles'),
            }
        });
    }
    _getHtmlForWebview(webview) {
        try {
            const indexPath = path.join(this._extensionUri.fsPath, 'webview-ui', 'build', 'index.html');
            let htmlContent = fs.readFileSync(indexPath, 'utf-8');
            // Add CSP to allow inline scripts and styles from vite-plugin-singlefile
            const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src *;">`;
            if (!htmlContent.includes('Content-Security-Policy')) {
                htmlContent = htmlContent.replace('<head>', `<head>\\n    ${csp}`);
            }
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