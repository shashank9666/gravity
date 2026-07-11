export interface IChatMessage {
  role: 'user' | 'agent' | 'system';
  content: string;
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
  
  chat(messages: IChatMessage[]): Promise<string>;
  chatStream(messages: IChatMessage[], onChunk: (chunk: string) => void): Promise<void>;
  
  // Future capabilities
  // toolCall(...): Promise<any>;
  // getEmbeddings(text: string): Promise<number[]>;
  // getModels(): Promise<string[]>;
}
