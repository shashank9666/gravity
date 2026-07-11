import * as vscode from 'vscode';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { ChatSidebarProvider } from './ui/sidebar/chatSidebarProvider';

let backendProcess: ChildProcess | undefined;

export function activate(context: vscode.ExtensionContext) {
    const provider = new ChatSidebarProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            ChatSidebarProvider.viewType,
            provider
        )
    );
}

export function deactivate() {
    if (backendProcess) {
        backendProcess.kill();
    }
}
