export interface IToolCall {
  id: string;
  name: string;
  arguments: any;
}

export interface IChatMessage {
  role: 'user' | 'agent' | 'system' | 'tool';
  content: string;
  toolCalls?: IToolCall[];
  toolCallId?: string; // For role = 'tool'
}

export interface IProviderConfig {
  apiKey?: string;
  endpoint?: string;
  organizationId?: string;
  projectId?: string;
  model?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
}

export interface IProvider {
  name: string;
  config: IProviderConfig;
  
  chat(messages: IChatMessage[], tools?: any[]): Promise<string>;
  chatStream(messages: IChatMessage[], tools: any[] | undefined, onChunk: (chunk: string) => void): Promise<void>;
  
  // Future capabilities
  // getEmbeddings(text: string): Promise<number[]>;
  // getModels(): Promise<string[]>;
}
