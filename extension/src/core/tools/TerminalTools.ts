import { exec } from 'child_process';
import { ITool } from './index';

export class TerminalTool implements ITool {
  public definition = {
    name: 'run_command',
    description: 'Executes a command in the terminal and returns the output.',
    parameters: {
      type: 'object' as const,
      properties: {
        command: {
          type: 'string',
          description: 'The shell command to execute'
        },
        cwd: {
          type: 'string',
          description: 'The current working directory for the command'
        }
      },
      required: ['command']
    }
  };

  async execute(args: any): Promise<string> {
    return new Promise((resolve) => {
      exec(args.command, { cwd: args.cwd }, (error, stdout, stderr) => {
        if (error) {
          resolve(`Error executing command: ${error.message}\nStderr: ${stderr}`);
          return;
        }
        resolve(stdout || stderr || 'Command executed successfully with no output.');
      });
    });
  }
}
