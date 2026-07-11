import { IProvider, IProviderConfig, IChatMessage } from './IProvider';

export class OpenAIProvider implements IProvider {
  name = 'OpenAI Compatible';

  constructor(public config: IProviderConfig) {}

  async chat(messages: IChatMessage[], tools?: any[]): Promise<string> {
    const response = await this._makeRequest(messages, false, tools);
    const data = await response.json();
    return data.choices[0].message.content;
  }

  async chatStream(messages: IChatMessage[], tools: any[] | undefined, onChunk: (chunk: string) => void): Promise<void> {
    try {
      const response = await this._makeRequest(messages, true, tools);
      
      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                onChunk(data.choices[0].delta.content);
              }
            } catch (e) {
              // Ignore parse errors on partial chunks
            }
          }
        }
      }
    } catch (error: any) {
      console.error("OpenAIProvider stream error:", error);
      throw error;
    }
  }

  private async _makeRequest(messages: IChatMessage[], stream: boolean, tools?: any[]): Promise<Response> {
    const endpoint = this.config.endpoint || 'https://api.openai.com/v1';
    const apiKey = this.config.apiKey;
    
    if (!apiKey) {
      throw new Error("API Key is missing for the AI Provider.");
    }

    const body: any = {
      model: this.config.model || 'gpt-4o',
      messages: messages,
      stream: stream,
      temperature: this.config.temperature ?? 0.7
    };

    if (tools && tools.length > 0) {
      body.tools = tools.map(t => ({
        type: 'function',
        function: t
      }));
    }

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Request failed (${response.status}): ${errorText}`);
    }

    return response;
  }
}

