export interface ToolParameter {
  type: string;
  description: string;
  enum?: string[];
  items?: any;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, ToolParameter>;
    required: string[];
  };
}

export interface ITool {
  definition: ToolDefinition;
  execute(args: any): Promise<string>;
}

export class ToolRegistry {
  private tools: Map<string, ITool> = new Map();

  registerTool(tool: ITool) {
    this.tools.set(tool.definition.name, tool);
  }

  getTools(): ToolDefinition[] {
    return Array.from(this.tools.values()).map(t => t.definition);
  }

  async executeTool(name: string, args: any): Promise<string> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }
    return await tool.execute(args);
  }
}
