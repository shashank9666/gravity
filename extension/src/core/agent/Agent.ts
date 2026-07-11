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

  public async executeTask(taskDescription: string, onUpdate: (update: string) => void): Promise<void> {
    onUpdate(`Analyzing task: ${taskDescription}\n`);

    const context = WorkspaceContext.gatherContext();
    const systemPrompt = `You are Gravity, an autonomous coding agent.\n\n${WorkspaceContext.formatContextForPrompt(context)}\nYou have access to tools. Use them to accomplish the task.`;

    this.messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: taskDescription }
    ];

    await this.runLoop(onUpdate);
  }

  private async runLoop(onUpdate: (update: string) => void): Promise<void> {
    const maxIterations = 10;
    let iterations = 0;

    while (iterations < maxIterations) {
      iterations++;
      const tools = this.toolRegistry.getTools();
      
      let fullResponse = '';
      await this.provider.chatStream(this.messages, tools, (chunk) => {
        fullResponse += chunk;
        onUpdate(chunk);
      });

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
