import { IProvider, IChatMessage } from '../providers/IProvider';
import { ToolRegistry } from '../tools';
import { WorkspaceContext } from '../context/WorkspaceContext';
import { ReadFileTool, WriteFileTool } from '../tools/FileTools';
import { TerminalTool } from '../tools/TerminalTools';

export class Agent {
  private toolRegistry: ToolRegistry;
  private messages: IChatMessage[] = [];

  constructor(private provider: IProvider) {
    this.toolRegistry = new ToolRegistry();
    this.toolRegistry.registerTool(new ReadFileTool());
    this.toolRegistry.registerTool(new WriteFileTool());
    this.toolRegistry.registerTool(new TerminalTool());
  }

  public clearHistory(): void {
    this.messages = [];
  }

  public async executeTask(taskDescription: string, onUpdate: (update: string) => void, onUsage?: (usage: any) => void): Promise<void> {
    onUpdate(`Analyzing task: ${taskDescription}\n`);

    const context = WorkspaceContext.gatherContext();
    const systemPrompt = `You are Gravity, an intelligent coding assistant integrated into VS Code.
Current Workspace Context:
${context}

You have access to the following tools:
${this.toolRegistry.getSystemPrompt()}

Use tools when necessary. Keep responses concise.`;

    // Only add system prompt if this is a new conversation (messages is empty)
    if (this.messages.length === 0) {
      this.messages.push({ role: 'system', content: systemPrompt });
    } else {
      // Always update the system prompt context on new turns
      this.messages[0] = { role: 'system', content: systemPrompt };
    }

    this.messages.push({ role: 'user', content: taskDescription });

    await this.runLoop(onUpdate, onUsage);
  }

  private async runLoop(onUpdate: (update: string) => void, onUsage?: (usage: any) => void): Promise<void> {
    const maxIterations = 10;
    let iterations = 0;

    while (iterations < maxIterations) {
      iterations++;
      const tools = this.toolRegistry.getTools();
      
      let fullResponse = '';
      await this.provider.chatStream(this.messages, tools, (chunk) => {
        fullResponse += chunk;
        onUpdate(chunk);
      }, onUsage);

      this.messages.push({ role: 'agent', content: fullResponse });

      // Note: A robust implementation would parse proper JSON tool calls here.
      // This is a simplified extraction for demonstration of the event loop.
      const toolCallMatch = fullResponse.match(/```json\s*\n\s*{\s*"tool":\s*"([^"]+)",\s*"args":\s*({[^}]+})\s*}\s*\n\s*```/);
      
      if (toolCallMatch) {
        const toolName = toolCallMatch[1];
        const argsStr = toolCallMatch[2];
        
        try {
          const args = JSON.parse(argsStr);
          onUpdate(JSON.stringify({ type: 'toolStart', toolName, args }) + '\n');
          const result = await this.toolRegistry.executeTool(toolName, args);
          onUpdate(JSON.stringify({ type: 'toolResult', toolName, result }) + '\n');
          
          this.messages.push({
            role: 'tool',
            content: result
          });
          
          // Loop will continue to give the LLM the tool result
        } catch (e: any) {
          onUpdate(JSON.stringify({ type: 'toolError', toolName, error: e.message }) + '\n');
          this.messages.push({ role: 'tool', content: `Error: ${e.message}` });
        }
      } else {
        // No tool calls found, the agent is done
        break;
      }
    }
  }
}
