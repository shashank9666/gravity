import { useState, useEffect, useRef } from 'react';

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

interface ChatViewProps {
  model?: string;
  onOpenSettings?: () => void;
}

export const ChatView = ({ model = 'gpt-4o', onOpenSettings }: ChatViewProps) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'agent', text: 'Hello! I am your Gravity agent. How can I help you?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
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
              const lines = message.text.split('\\n');
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
                    const tool = lastMsg.toolCalls.find(t => t.toolName === event.toolName && t.status === 'running');
                    if (tool) {
                      tool.status = 'success';
                      tool.result = event.result;
                    }
                  } else if (event.type === 'toolError') {
                    const tool = lastMsg.toolCalls.find(t => t.toolName === event.toolName && t.status === 'running');
                    if (tool) {
                      tool.status = 'error';
                      tool.result = event.error;
                    }
                  }
                } else {
                  lastMsg.text += line;
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
      }
    };

    window.addEventListener('message', handleMessage);
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

  return (
    <div className="chat-view">
      <div className="chat-header">
        <div className="chat-header-title">GRAVITY: CHAT</div>
        <div className="chat-header-actions">
          <button className="icon-btn" title="New Chat">＋</button>
          <button className="icon-btn" title="History">🕒</button>
          <button className="icon-btn" title="Settings" onClick={onOpenSettings}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M14.4 9.1v-.2l-1.3-.3c-.1-.4-.3-.8-.5-1.2l.8-1-.1-.1-1.3-1.3-.1-.1-1 .8c-.4-.2-.8-.4-1.2-.5l-.3-1.3h-.2h-1.8h-.2l-.3 1.3c-.4.1-.8.3-1.2.5l-1-.8-.1.1-1.3 1.3-.1.1.8 1c-.2.4-.4.8-.5 1.2l-1.3.3v.2v1.8v.2l1.3.3c.1.4.3.8.5 1.2l-.8 1 .1.1 1.3 1.3.1.1 1-.8c.4.2.8.4 1.2.5l.3 1.3h.2h1.8h.2l.3-1.3c.4-.1.8-.3 1.2-.5l1 .8.1-.1 1.3-1.3.1-.1-.8-1c.2-.4.4-.8.5-1.2l1.3-.3v-.2V9.1zM8 10.5c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z"/></svg>
          </button>
          <div style={{ position: 'relative' }}>
            <button className="icon-btn" title="More Actions" onClick={() => setMenuOpen(!menuOpen)}>⋯</button>
            {menuOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={() => setMenuOpen(false)}>Customization</div>
                <div className="dropdown-item" onClick={() => setMenuOpen(false)}>MCP Servers</div>
                <div className="dropdown-item" onClick={() => setMenuOpen(false)}>Export</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-bubble ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-area">
        <div className="chat-input-wrapper" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            className="chat-input"
          />
          <div className="chat-input-actions" style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px' }}>
            <div style={{ position: 'relative' }}>
              <div 
                style={{ fontSize: '11px', color: 'var(--vscode-descriptionForeground)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px', borderRadius: '4px' }} 
                onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                className="model-shortcut"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M14 7v1H8v6H7V8H1V7h6V1h1v6h6z"/></svg>
                {model}
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M4.2 10.8l3.3-3.3.5-.5.5.5 3.3 3.3.7-.7-4.5-4.5-4.5 4.5z"/></svg>
              </div>
              
              {modelDropdownOpen && (
                <div className="dropdown-menu" style={{ bottom: '100%', left: '0', top: 'auto', marginBottom: '8px', minWidth: '180px' }}>
                  <div className="dropdown-item" style={{ borderBottom: '1px solid var(--vscode-dropdown-border)' }}>
                    <div style={{ fontWeight: 'bold' }}>{model}</div>
                    <div style={{ fontSize: '10px', opacity: 0.7 }}>Current Model</div>
                  </div>
                  <div className="dropdown-item" onClick={() => {
                    setModelDropdownOpen(false);
                    if (onOpenSettings) onOpenSettings();
                  }}>
                    ⚙️ Change Model (Settings)
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex' }}>
              {inputValue.trim().length > 0 ? (
                <button className="icon-btn send-btn" title="Send" onClick={handleSend}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1 14l14-6L1 2v4.5l9 1.5-9 1.5V14z"/></svg>
                </button>
              ) : (
                <button className="icon-btn" title="Voice Input">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 11c1.66 0 3-1.34 3-3V4c0-1.66-1.34-3-3-3S5 2.34 5 4v4c0 1.66 1.34 3 3 3zm4-3c0 2.21-1.79 4-4 4s-4-1.79-4-4H2c0 3.03 2.28 5.56 5.17 5.95V15h1.66v-2.05C11.72 12.56 14 10.03 14 8h-2z"/></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
