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
                vscode.Uri.joinPath(this._extensionUri, 'webview-ui', 'dist')
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
                provider: config.get('provider'),
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
        // Get URI for the script and style
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'webview-ui', 'dist', 'assets', 'index.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'webview-ui', 'dist', 'assets', 'index.css'));

        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' 'unsafe-eval'; connect-src *; img-src data: ${webview.cspSource} https:; font-src data: ${webview.cspSource};">
                <link href="${styleUri}" rel="stylesheet">
                <title>Gravity Webview</title>
            </head>
            <body>
                <div id="root"></div>
                <script nonce="${nonce}" type="module" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
