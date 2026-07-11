import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Agent } from '../../core/agent/Agent';
import { OpenAIProvider } from '../../core/providers/OpenAIProvider';

export class ChatSidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'gravityChatView';
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this._extensionUri, 'webview-ui', 'build')
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data: any) => {
            if (data.type === 'sendMessage') {
                await this._handleChatRequest(data.text, webviewView.webview);
            } else if (data.type === 'getSettings') {
                this._sendSettingsToWebview(webviewView.webview);
            } else if (data.type === 'updateSetting') {
                const config = vscode.workspace.getConfiguration('gravity');
                await config.update(data.key, data.value, vscode.ConfigurationTarget.Global);
            }
        });
    }

    private async _handleChatRequest(userMessage: string, webview: vscode.Webview) {
        const config = vscode.workspace.getConfiguration('gravity');
        const providerConfig = {
            endpoint: config.get<string>('apiEndpoint'),
            apiKey: config.get<string>('apiKey'),
            model: config.get<string>('model')
        };

        try {
            const provider = new OpenAIProvider(providerConfig);
            const agent = new Agent(provider);
            
            // Send initial empty response so UI creates bubble
            webview.postMessage({ type: 'agentResponse', text: '', new: true });

            await agent.executeTask(userMessage, (chunk: string) => {
                webview.postMessage({
                    type: 'agentResponseChunk',
                    text: chunk
                });
            });
            
            webview.postMessage({ type: 'agentResponseDone' });
        } catch (error: any) {
            webview.postMessage({
                type: 'agentError',
                text: `Error connecting to provider: ${error.message}. Check your settings.`
            });
        }
    }

    private _sendSettingsToWebview(webview: vscode.Webview) {
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

    private _getHtmlForWebview(webview: vscode.Webview) {
        try {
            const indexPath = path.join(this._extensionUri.fsPath, 'webview-ui', 'build', 'index.html');
            let htmlContent = fs.readFileSync(indexPath, 'utf-8');
            
            // Add CSP to allow inline scripts and styles from vite-plugin-singlefile
            const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src *;">`;
            if (!htmlContent.includes('Content-Security-Policy')) {
                htmlContent = htmlContent.replace('<head>', `<head>\\n    ${csp}`);
            }
            
            return htmlContent;
        } catch (error) {
            console.error('Error reading index.html:', error);
            return `<!DOCTYPE html><html lang="en"><body><h1>Failed to load Gravity UI</h1></body></html>`;
        }
    }
}
