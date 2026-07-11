import * as vscode from 'vscode';

export interface AgentContext {
  activeFile: string | null;
  cursorPosition: { line: number; character: number } | null;
  openFiles: string[];
  workspaceRoot: string | null;
}

export class WorkspaceContext {
  public static gatherContext(): AgentContext {
    const config = vscode.workspace.getConfiguration('gravity.context');
    const includeOpenEditors = config.get<boolean>('includeOpenEditors', true);
    const includeCursorPosition = config.get<boolean>('includeCursorPosition', true);
    const includeWorkspaceRoot = config.get<boolean>('includeWorkspaceRoot', true);

    const activeEditor = vscode.window.activeTextEditor;
    const activeFile = activeEditor ? activeEditor.document.uri.fsPath : null;
    const cursorPosition = (activeEditor && includeCursorPosition) ? {
      line: activeEditor.selection.active.line,
      character: activeEditor.selection.active.character
    } : null;

    const openFiles = includeOpenEditors ? vscode.workspace.textDocuments
      .map(doc => doc.uri.fsPath)
      .filter(path => !path.includes('.git')) : [];

    const workspaceRoot = (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 && includeWorkspaceRoot)
      ? vscode.workspace.workspaceFolders[0].uri.fsPath 
      : null;

    return {
      activeFile,
      cursorPosition,
      openFiles,
      workspaceRoot
    };
  }

  public static formatContextForPrompt(context: AgentContext): string {
    let result = '=== WORKSPACE CONTEXT ===\n';
    if (context.workspaceRoot) {
      result += `Workspace Root: ${context.workspaceRoot}\n`;
    }
    if (context.activeFile) {
      result += `Active File: ${context.activeFile}\n`;
      if (context.cursorPosition) {
        result += `Cursor at Line ${context.cursorPosition.line + 1}, Column ${context.cursorPosition.character}\n`;
      }
    }
    if (context.openFiles.length > 0) {
      result += `Other Open Files:\n- ${context.openFiles.join('\n- ')}\n`;
    }
    result += '=========================\n';
    return result;
  }
}
