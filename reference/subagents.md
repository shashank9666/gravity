# Asynchronous Subagents

Subagents are an excellent way to parallelize complex tasks and preserve the context of your main agent. Instead of executing every step serially, an agent can delegate tasks—such as running tests or performing extensive codebase searches—to dedicated subagents. This architecture frees the parent agent to continue working on other tasks in parallel and prevents its context window from being polluted by the details of a subagent's work.

## Invoking Subagents
The parent agent calls the `invoke_subagent` tool to spawn a new concurrent session with a dedicated role and initial prompt.
- **Workspace Options**: The subagent can either inherit the same workspace as its parent or create an isolated Git worktree.
- **Context Isolation**: The subagent runs using the same model as its parent but does not inherit the parent's existing conversation history.
- **Execution**: Once invoked, the subagent immediately begins executing its task.

## Subagent Lifecycle and States
Subagents run asynchronously in the background, allowing the parent agent to delegate a task and immediately resume its own work. At any point, a subagent exists in one of three states:

### 1. Running
The subagent is actively executing its task, calling tools, and generating responses.
- **Cancellation**: You can cancel a running subagent by clicking the Stop Subagent button.
- **Parent Control**: The parent agent can also interrupt a subagent or kill it entirely.

### 2. Idle
The subagent has completed its task, sent a message containing the results to its parent agent, and stopped execution.
- **Re-awakening**: An idle agent can be awoken and return to the Running state upon receiving a message.
- **Context Retention**: When awoken, the agent retains all context from its prior work.

### 3. Killed
The subagent is permanently terminated and cannot be re-awoken.

## Inter-Agent Communication
Agents communicate by sending messages to each other using unique agent IDs.
- **Flexible Routing**: Agents can communicate with any other active agent whose ID is known.
- **Auto-Wake**: If an idle agent receives a message, it is automatically re-awakened.
- **Shared Transcripts**: Agents can view each other's conversation transcripts.

## Built-In vs. Custom Subagents

### Built-In Subagents
- `research`: Optimized for codebase research, navigation, and exploration.
- `browser`: Operates sandboxed web browsers to perform interactive browser tasks.
- `self`: A direct clone of the calling agent.

### Custom Subagents
Agents can define their own custom subagents dynamically using the `define_subagent` tool.

## Delegation Hierarchy and Limits
Subagents can invoke their own subagents, enabling multiple layers of delegation.
- **Nesting Depth Limit**: A maximum nesting depth of 10 levels is strictly enforced.

## Permissions and Configuration Inheritance
Subagents inherit their parent's safety configurations:
- **Inherited Scopes**: Subagents automatically inherit the parent's allowed terminal command prefixes and file scopes.
- **Permission Bubbling**: If a subagent encounters a tool call that requires explicit user confirmation, the request is bubbled up for your approval.
