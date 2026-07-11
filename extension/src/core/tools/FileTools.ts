import * as vscode from 'vscode';
import * as fs from 'fs';
import { ITool } from './index';

export class ReadFileTool implements ITool {
  public definition = {
    name: 'read_file',
    description: 'Reads the contents of a file from the workspace.',
    parameters: {
      type: 'object' as const,
      properties: {
        absolutePath: {
          type: 'string',
          description: 'Absolute path to the file to read'
        }
      },
      required: ['absolutePath']
    }
  };

  async execute(args: any): Promise<string> {
    try {
      const uri = vscode.Uri.file(args.absolutePath);
      const data = await vscode.workspace.fs.readFile(uri);
      return Buffer.from(data).toString('utf8');
    } catch (e: any) {
      return `Error reading file: ${e.message}`;
    }
  }
}

export class WriteFileTool implements ITool {
  public definition = {
    name: 'write_file',
    description: 'Writes content to a file in the workspace.',
    parameters: {
      type: 'object' as const,
      properties: {
        absolutePath: {
          type: 'string',
          description: 'Absolute path to the file to write'
        },
        content: {
          type: 'string',
          description: 'The content to write into the file'
        }
      },
      required: ['absolutePath', 'content']
    }
  };

  async execute(args: any): Promise<string> {
    try {
      const uri = vscode.Uri.file(args.absolutePath);
      await vscode.workspace.fs.writeFile(uri, Buffer.from(args.content, 'utf8'));
      return `Successfully wrote to ${args.absolutePath}`;
    } catch (e: any) {
      return `Error writing to file: ${e.message}`;
    }
  }
}
