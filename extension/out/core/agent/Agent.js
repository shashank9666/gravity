"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
class Agent {
    provider;
    constructor(provider) {
        this.provider = provider;
    }
    async executeTask(taskDescription, onUpdate) {
        onUpdate(`Analyzing task: ${taskDescription}`);
        // Future: implement planner, executor, tools
        const messages = [
            { role: 'system', content: 'You are an autonomous coding agent.' },
            { role: 'user', content: taskDescription }
        ];
        await this.provider.chatStream(messages, (chunk) => {
            onUpdate(chunk);
        });
    }
}
exports.Agent = Agent;
//# sourceMappingURL=Agent.js.map