import { IProvider, IChatMessage } from '../providers/IProvider';

export class Agent {
  constructor(private provider: IProvider) {}

  public async executeTask(taskDescription: string, onUpdate: (update: string) => void): Promise<void> {
    onUpdate(`Analyzing task: ${taskDescription}`);
    // Future: implement planner, executor, tools
    const messages: IChatMessage[] = [
      { role: 'system', content: 'You are an autonomous coding agent.' },
      { role: 'user', content: taskDescription }
    ];

    await this.provider.chatStream(messages, (chunk) => {
      onUpdate(chunk);
    });
  }
}
