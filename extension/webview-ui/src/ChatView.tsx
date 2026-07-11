import { useState, useEffect, useRef } from 'react';
import { ToolExecutionLog } from './components/chat/ToolExecutionLog';
import { HistoryPanel } from './components/chat/HistoryPanel';

export type ToolCallInfo = {
  id: string;
  toolName: string;
  args: any;
  result?: string;
  status: 'running' | 'success' | 'error';
};

export type Message = {
  id: number;
  sender: 'user' | 'agent' | 'error';
  text: string;
  toolCalls?: ToolCallInfo[];
};

import { vscode } from './vscodeApi';
import { Settings, Plus, History, MoreHorizontal, Settings2 } from 'lucide-react';

interface ChatViewProps {
  model?: string;
  onOpenSettings?: () => void;
  onOpenContextSettings?: () => void;
}

export const ChatView = ({ model = 'gpt-4o', onOpenSettings, onOpenContextSettings }: ChatViewProps) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedState = vscode.getState();
    return savedState?.messages || [
      { id: 1, sender: 'agent', text: 'Hello! I am your Gravity agent. How can I help you?', toolCalls: [] }
    ];
  });
  const [inputValue, setInputValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [tokenUsage, setTokenUsage] = useState<{prompt_tokens?: number, completion_tokens?: number, total_tokens?: number} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    vscode.setState({ messages });
  }, [messages]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'agentResponse' && message.new) {
        setMessages((prev) => [...prev, { id: Date.now(), sender: 'agent', text: message.text, toolCalls: [] }]);
      } else if (message.type === 'agentResponseChunk') {
        setMessages((prev) => {
          const newMsgs = [...prev];
          const lastMsg = newMsgs[newMsgs.length - 1];
          if (lastMsg && lastMsg.sender === 'agent') {
            try {
              const lines = message.text.split('\n');
              for (const line of lines) {
                if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
                  const event = JSON.parse(line.trim());

                  if (!lastMsg.toolCalls) lastMsg.toolCalls = [];

                  if (event.type === 'toolStart') {
                    lastMsg.toolCalls.push({
                      id: event.toolName + '_' + Date.now(),
                      toolName: event.toolName,
                      args: event.args,
                      status: 'running'
                    });
                  } else if (event.type === 'toolResult') {
                    // find last running tool of this type
                    const tools = lastMsg.toolCalls.filter(t => t.toolName === event.toolName && t.status === 'running');
                    const tool = tools[tools.length - 1];
                    if (tool) {
                      tool.status = 'success';
                      tool.result = event.result;
                    }
                  } else if (event.type === 'toolError') {
                    const tools = lastMsg.toolCalls.filter(t => t.toolName === event.toolName && t.status === 'running');
                    const tool = tools[tools.length - 1];
                    if (tool) {
                      tool.status = 'error';
                      tool.result = event.error;
                    }
                  }
                } else {
                  lastMsg.text += line + '\n';
                }
              }
            } catch (e) {
              lastMsg.text += message.text; // Fallback to raw text if not json
            }
          }
          return newMsgs;
        });
      } else if (message.type === 'agentError') {
        setMessages((prev) => [...prev, { id: Date.now(), sender: 'error', text: message.text }]);
      } else if (message.type === 'agentUsage') {
        setTokenUsage(message.usage);
      } else if (message.type === 'historySync') {
        setSessions(message.history || []);
      }
    };

    window.addEventListener('message', handleMessage);
    if (vscode) {
      vscode.postMessage({ type: 'getHistory' });
    }
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    setMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: inputValue }]);

    if (vscode) {
      vscode.postMessage({
        type: 'sendMessage',
        text: inputValue
      });
    } else {
      setTimeout(() => {
        setMessages((prev) => [...prev, { id: Date.now(), sender: 'agent', text: 'Echo: ' + inputValue }]);
      }, 500);
    }

    setInputValue('');
  };

  const handleNewChat = () => {
    if (messages.length > 1) {
      const userMessage = messages.find(m => m.sender === 'user');
      const title = userMessage ? (userMessage.text.length > 30 ? userMessage.text.slice(0, 30) + '...' : userMessage.text) : 'New Conversation';
      const newSession = {
        id: Date.now().toString(),
        title,
        date: new Date().toLocaleDateString(),
        messages: [...messages]
      };
      const newSessions = [newSession, ...sessions];
      setSessions(newSessions);
      if (vscode) {
        vscode.postMessage({ type: 'saveHistory', history: newSessions });
      }
    }

    setMessages([{ id: 1, sender: 'agent', text: 'Hello! I am your Gravity agent. How can I help you?', toolCalls: [] }]);
    vscode.setState({ messages: [{ id: 1, sender: 'agent', text: 'Hello! I am your Gravity agent. How can I help you?', toolCalls: [] }] });
    setTokenUsage(null);
    if (vscode) {
      vscode.postMessage({ type: 'newChat' });
    }
  };

  const handleOpenHistory = () => {
    setHistoryOpen(true);
    if (vscode) {
      vscode.postMessage({ type: 'getHistory' });
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/40 bg-muted/20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold tracking-wider text-muted-foreground">GRAVITY: CHAT</div>
          {tokenUsage && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-medium text-primary shadow-sm" title={`Prompt: ${tokenUsage.prompt_tokens} | Completion: ${tokenUsage.completion_tokens}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/70"></div>
              <span>{(tokenUsage.total_tokens || 0).toLocaleString()}</span>
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="New Chat" onClick={handleNewChat}>
            <Plus size={16} />
          </button>
          <button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="History" onClick={handleOpenHistory}>
            <History size={16} />
          </button>
          <button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Settings" onClick={onOpenSettings}>
            <Settings size={16} />
          </button>
          <div className="relative">
            <button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="More Actions" onClick={() => setMenuOpen(!menuOpen)}>
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-md shadow-md py-1 z-50">
                <button className="w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-accent transition-colors flex items-center gap-2" onClick={() => { setMenuOpen(false); if (onOpenContextSettings) onOpenContextSettings(); }}>
                  <Settings2 size={14} /> View Context Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <HistoryPanel 
        isOpen={historyOpen} 
        onClose={() => setHistoryOpen(false)} 
        sessions={sessions}
        onSelectSession={(session) => {
          setMessages(session.messages);
          setHistoryOpen(false);
        }}
        onDeleteSession={(id) => {
          const newSessions = sessions.filter(s => s.id !== id);
          setSessions(newSessions);
          if (vscode) {
            vscode.postMessage({ type: 'saveHistory', history: newSessions });
          }
        }}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col max-w-[90%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
            <div className={`p-3 rounded-lg text-sm shadow-sm ${msg.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : msg.sender === 'error' ? 'bg-destructive/20 text-destructive border border-destructive/50' : 'bg-card border border-border/40 rounded-bl-none'}`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {msg.toolCalls && msg.toolCalls.map((tool) => (
                <div key={tool.id} className="mt-2 w-full max-w-sm text-left">
                  <ToolExecutionLog
                    toolName={tool.toolName}
                    args={tool.args}
                    result={tool.result}
                    status={tool.status}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border/40 bg-muted/10 shrink-0">
        <div className="relative bg-background border border-border/50 rounded-lg shadow-sm focus-within:border-ring focus-within:ring-1 focus-within:ring-ring transition-all">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            className="w-full bg-transparent p-3 text-sm focus:outline-none"
          />
          <div className="flex justify-between items-center px-3 pb-2 pt-1 border-t border-border/20">
            <div className="relative">
              <div
                className="flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M14 7v1H8v6H7V8H1V7h6V1h1v6h6z" /></svg>
                {model}
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M4.2 10.8l3.3-3.3.5-.5.5.5 3.3 3.3.7-.7-4.5-4.5-4.5 4.5z" /></svg>
              </div>

              {modelDropdownOpen && (
                <div className="absolute left-0 bottom-full mb-1 w-48 bg-popover border border-border rounded-md shadow-md py-1 z-50">
                  <div className="px-3 py-2 border-b border-border">
                    <div className="font-bold text-sm text-foreground">{model}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Current Model</div>
                  </div>
                  <div className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center gap-2" onClick={() => {
                    setModelDropdownOpen(false);
                    if (onOpenSettings) onOpenSettings();
                  }}>
                    <Settings2 size={14} /> Change Model (Settings)
                  </div>
                </div>
              )}
            </div>

            <div className="flex">
              {inputValue.trim().length > 0 ? (
                <button className="p-1.5 rounded-md bg-primary text-primary-foreground shadow hover:bg-primary/90 transition-colors" title="Send" onClick={handleSend}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M1 14l14-6L1 2v4.5l9 1.5-9 1.5V14z" /></svg>
                </button>
              ) : (
                <button className="p-1.5 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Voice Input">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 11c1.66 0 3-1.34 3-3V4c0-1.66-1.34-3-3-3S5 2.34 5 4v4c0 1.66 1.34 3 3 3zm4-3c0 2.21-1.79 4-4 4s-4-1.79-4-4H2c0 3.03 2.28 5.56 5.17 5.95V15h1.66v-2.05C11.72 12.56 14 10.03 14 8h-2z" /></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
